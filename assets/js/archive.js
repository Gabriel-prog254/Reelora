/*
 * Free movie data layer powered by the Internet Archive (archive.org).
 *
 * Unlike TMDB it needs NO API key, so search and playback keep working on
 * a static site even when the TMDB key is a placeholder.
 *
 * Responsibilities:
 *   - Search public-domain films via the advancedsearch API.
 *   - Fetch item metadata for details (description, genres, cast, ...).
 *   - Resolve the best playable MP4 file for an item (download endpoint).
 *   - Cache responses and deduplicate in-flight requests.
 *
 * Exposes: window.ArchiveAPI
 */

(function () {
    "use strict";

    var ROOT = "https://archive.org";
    var SEARCH = ROOT + "/advancedsearch.php";

    var metaCache = new Map();      // identifier -> metadata response
    var metaInflight = new Map();   // identifier -> in-flight promise
    var streamCache = new Map();    // identifier -> stream url or null
    var searchCache = new Map();    // query -> results


    /* ---------- request helpers ---------- */

    function getJSON(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) {
                throw new Error("archive.org request failed (" + res.status + ")");
            }
            return res.json();
        });
    }

    function thumbnail(id) {
        return ROOT + "/services/img/" + encodeURIComponent(id);
    }

    function downloadFile(id, name) {
        return ROOT + "/download/" + encodeURIComponent(id) + "/" + encodeURIComponent(name);
    }


    /* ---------- metadata (cached, deduped) ---------- */

    function getMetadata(id) {
        if (metaCache.has(id)) {
            return Promise.resolve(metaCache.get(id));
        }
        if (metaInflight.has(id)) {
            return metaInflight.get(id);
        }

        var promise = getJSON(ROOT + "/metadata/" + encodeURIComponent(id)).then(function (data) {
            metaCache.set(id, data);
            return data;
        });

        metaInflight.set(id, promise);
        promise.then(
            function () { metaInflight.delete(id); },
            function () { metaInflight.delete(id); }
        );

        return promise;
    }

    /* Smallest helper to safely turn any value into an array of strings. */
    function toList(value) {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value.map(function (v) { return String(v).trim(); }).filter(Boolean);
        }
        return String(value).split(/[;,/]/).map(function (v) { return v.trim(); }).filter(Boolean);
    }

    function stripTags(html) {
        if (!html) {
            return "";
        }
        return String(html)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    /* Flatten archive.org metadata into the shape toView() understands. */
    function normalizeDetails(id, data) {
        var meta = data.metadata || {};
        var title = meta.title || id;

        var year = "";
        var date = meta.date || meta.year || meta.publicdate || "";
        if (date) {
            year = String(date).match(/\d{4}/);
            year = year ? year[0] : "";
        }

        var runtime = "";
        var len = meta.Length || "";
        if (len) {
            var mins = Number(len.match(/\d+/));
            if (isFinite(mins) && mins > 0) {
                var h = Math.floor(mins / 60);
                var m = mins % 60;
                runtime = (h ? h + "h" : "") + (m ? " " + m + "m" : "").trim();
            }
        }

        var genres = toList(meta.genre).slice(0, 3);

        return {
            id: id,
            type: "movie",
            title: title,
            poster: thumbnail(id),
            backdrop: thumbnail(id),
            overview: stripTags(meta.description) || "No description available.",
            year: year,
            genres: genres,
            runtime: runtime,
            rating: null,
            cast: toList(meta.actor).slice(0, 5),
            director: (toList(meta.director)[0] || "") || "Unknown",
            language: (toList(meta.language)[0] || "") || "—",
            ageRating: null,
            trailer: null,
            archiveId: id
        };
    }


    /* ---------- search ---------- */

    function escapeLucene(text) {
        return String(text).replace(/[+\-&|!(){}\[\]^"~*?:\\/]/g, "\\$&");
    }

    function search(query) {
        var needle = String(query || "").trim();
        if (!needle) {
            return Promise.resolve([]);
        }

        if (searchCache.has(needle)) {
            return Promise.resolve(searchCache.get(needle));
        }

        var q = 'title:"' + escapeLucene(needle) + '" AND mediatype:movies';
        var url = SEARCH +
            "?q=" + encodeURIComponent(q) +
            "&rows=24" +
            "&fl[]=identifier&fl[]=title&fl[]=year&fl[]=description" +
            "&output=json";

        var promise = getJSON(url).then(function (data) {
            var docs = (data.response && data.response.docs) || [];
            var results = docs.map(function (doc) {
                return {
                    id: null,
                    type: "movie",
                    slug: doc.identifier,
                    title: doc.title || doc.identifier,
                    poster: thumbnail(doc.identifier),
                    year: (doc.year || "").toString() || "",
                    genres: toList(doc.subject).slice(0, 2),
                    archiveId: doc.identifier
                };
            });

            searchCache.set(needle, results);
            return results;
        });

        promise.catch(function () { /* leave searchCache empty — retry next time */ });
        return promise;
    }


    /* ---------- detail ---------- */

    function getDetails(id) {
        return getMetadata(id).then(function (data) {
            return normalizeDetails(id, data);
        });
    }


    /* ---------- stream resolution ---------- */

    /* Pick the file best suited for streaming:
     * prefer the "512Kb MPEG4" / "h.264 IA" derivatives, then the original MPEG4. */
    function pickStream(files) {
        if (!files || !files.length) {
            return null;
        }

        var videos = files.filter(function (f) {
            var name = f.name || "";
            return /\.mp4$/i.test(name) && name.indexOf(".thumbs") === -1;
        });

        if (!videos.length) {
            return null;
        }

        var score = function (f) {
            var name = f.name || "";
            var s = 0;
            if (f.format === "512Kb MPEG4" || name.indexOf("_512kb.") !== -1) { s += 60; }
            if (/\.ia\.mp4$/i.test(name)) { s += 50; }
            if (f.format === "MPEG4") { s += 40; }
            if (/h\.264/i.test(f.format)) { s += 20; }
            return s;
        };

        videos.sort(function (a, b) {
            return (score(b) - score(a)) || ((b.size || 0) - (a.size || 0));
        });

        return videos[0].name;
    }

    function getStream(id) {
        if (streamCache.has(id)) {
            return Promise.resolve(streamCache.get(id));
        }

        var promise = getMetadata(id).then(function (data) {
            var name = pickStream(data.files || []);
            if (!name) {
                return null;
            }
            return downloadFile(id, name);
        });

        promise.then(
            function (url) { streamCache.set(id, url); },
            function () { /* nothing to cache on failure */ }
        );

        return promise;
    }


    /* Best-effort: keep looking until a streamable item is found. */
    function findStreamByTitle(title) {
        return search(title).then(function (results) {
            var chain = function (i) {
                if (i >= results.length) {
                    return null;
                }
                return getStream(results[i].archiveId).then(function (url) {
                    if (url) {
                        return url;
                    }
                    return chain(i + 1);
                });
            };
            return chain(0);
        });
    }


    /* ---------- public API ---------- */

    window.ArchiveAPI = {
        enabled: true,
        search: search,
        getDetails: getDetails,
        getStream: getStream,
        findStreamByTitle: findStreamByTitle
    };
})();