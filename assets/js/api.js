/*
 * Movie data layer for the TMDB API (https://www.themoviedb.org).
 *
 * Responsibilities:
 *   - Fetch movie / TV details + credits from TMDB.
 *   - Normalize the API response into one clean shape used by the UI.
 *   - Cache every successful response so the same movie is never fetched twice.
 *   - Deduplicate in-flight requests (shared promises).
 *   - Limit concurrent requests to avoid hammering the API.
 *   - Fall back cleanly when configuration or responses are missing.
 *
 * Exposes: window.TMDB
 */

(function () {
    "use strict";

    var cfg = window.TMDB_CONFIG || {};
    var PLACEHOLDER = "REPLACE_WITH_YOUR_API_KEY";

    var cache = new Map();            // "type:id" -> normalized movie
    var inflight = new Map();         // "type:id" -> in-flight promise
    var trailerCache = new Map();     // "type:id" -> youtube key or null
    var trailerInflight = new Map();  // "type:id" -> in-flight promise

    var queue = [];
    var active = 0;
    var MAX_CONCURRENT = 4;


    /* ---------- config helpers ---------- */

    function hasKey() {
        return !!(cfg.apiKey && cfg.apiKey !== PLACEHOLDER);
    }

    function imageUrl(size, path) {
        if (!path) {
            return null;
        }
        return (cfg.imageBase || "https://image.tmdb.org/t/p/") + size + path;
    }


    /* ---------- request handling ---------- */

    function request(path) {
        var base = cfg.baseUrl || "https://api.themoviedb.org/3";
        var sep = path.indexOf("?") === -1 ? "?" : "&";

        var url =
            base +
            path +
            sep +
            "api_key=" + encodeURIComponent(cfg.apiKey) +
            (cfg.language ? "&language=" + encodeURIComponent(cfg.language) : "");

        return fetch(url).then(function (res) {
            if (!res.ok) {
                throw new Error("TMDB request failed (" + res.status + ")");
            }
            return res.json();
        });
    }

    /* Limited-concurrency queue so batches of cards don't slam the API. */
    function enqueue(fn) {
        return new Promise(function (resolve, reject) {
            queue.push({ fn: fn, resolve: resolve, reject: reject });
            pump();
        });
    }

    function pump() {
        if (active >= MAX_CONCURRENT || queue.length === 0) {
            return;
        }

        active += 1;
        var job = queue.shift();

        job.fn().then(
            function (value) {
                job.resolve(value);
                jobDone();
            },
            function (error) {
                job.reject(error);
                jobDone();
            }
        );
    }

    function jobDone() {
        active -= 1;
        pump();
    }


    /* ---------- normalization ---------- */

    function formatRuntime(minutes) {
        if (typeof minutes !== "number" || minutes <= 0) {
            return "";
        }
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        return (h ? h + "h" : "") + (m ? " " + m + "m" : "").trim();
    }

    function findDirector(credits) {
        var crew = (credits && credits.crew) || [];
        for (var i = 0; i < crew.length; i += 1) {
            if (crew[i].job === "Director" && crew[i].name) {
                return crew[i].name;
            }
        }
        return "";
    }

    function normalize(detail, credits, type) {
        var isSeries = type === "tv";
        var date = isSeries ? detail.first_air_date : detail.release_date;
        var genres = (detail.genres || []).map(function (g) { return g.name; }).slice(0, 3);
        var runtime = "";

        if (isSeries) {
            if (typeof detail.number_of_seasons === "number" && detail.number_of_seasons > 0) {
                runtime = detail.number_of_seasons + (detail.number_of_seasons === 1 ? " Season" : " Seasons");
            }
        } else {
            runtime = formatRuntime(detail.runtime);
        }

        var cast = ((credits && credits.cast) || [])
            .slice(0, 5)
            .map(function (c) { return c.name; });

        var director = findDirector(credits);
        if (!director && isSeries && detail.created_by && detail.created_by[0]) {
            director = detail.created_by[0].name;
        }

        var spoken = (detail.spoken_languages && detail.spoken_languages[0] &&
            detail.spoken_languages[0].english_name) || "";
        var language = spoken || (detail.original_language
            ? detail.original_language.toUpperCase()
            : "\u2014");

        return {
            id: detail.id,
            type: type || "movie",
            title: detail.title || detail.name || "Unknown title",
            poster: imageUrl("w500", detail.poster_path),
            backdrop: imageUrl("original", detail.backdrop_path),
            overview: detail.overview || "",
            year: (date || "").slice(0, 4) || "",
            genres: genres,
            runtime: runtime,
            rating: typeof detail.vote_average === "number" ? detail.vote_average : null,
            cast: cast,
            director: director || "Unknown",
            language: language || "\u2014",
            ageRating: null,
            trailer: null
        };
    }


    /* ---------- detail + credits (cached, deduped) ---------- */

    function getDetails(id, type) {
        var kind = type === "tv" ? "tv" : "movie";
        var key = id + "_" + kind;

        if (hasKey() === false) {
            return Promise.reject(new Error("TMDB API key is not configured."));
        }

        if (cache.has(key)) {
            return Promise.resolve(cache.get(key));
        }

        if (inflight.has(key)) {
            return inflight.get(key);
        }

        var promise = enqueue(function () {
            return Promise.all([
                request("/" + kind + "/" + id),
                request("/" + kind + "/" + id + "/credits")
            ]);
        }).then(function (results) {
            var movie = normalize(results[0], results[1], kind);
            cache.set(key, movie);
            return movie;
        });

        inflight.set(key, promise);
        promise.then(
            function () { inflight.delete(key); },
            function () { inflight.delete(key); }
        );

        return promise;
    }

    function getCached(id, type) {
        var kind = type === "tv" ? "tv" : "movie";
        return cache.get(id + "_" + kind) || null;
    }


    /* ---------- trailer (lazy, cached, deduped) ---------- */

    function getTrailer(id, type) {
        var kind = type === "tv" ? "tv" : "movie";
        var key = id + "_" + kind;

        if (hasKey() === false) {
            return Promise.resolve(null);
        }

        if (trailerCache.has(key)) {
            return Promise.resolve(trailerCache.get(key));
        }

        if (trailerInflight.has(key)) {
            return trailerInflight.get(key);
        }

        var promise = enqueue(function () {
            return request("/" + kind + "/" + id + "/videos");
        }).then(function (data) {
            var videos = (data && data.results) || [];

            var youtube = videos.filter(function (v) { return v.site === "YouTube"; });
            var trailer = youtube.filter(function (v) { return v.type === "Trailer"; });
            var pick = trailer[0] || youtube[0] || null;

            var keyStr = pick && pick.key ? pick.key : null;
            trailerCache.set(key, keyStr);
            return keyStr;
        });

        trailerInflight.set(key, promise);
        promise.then(
            function () { trailerInflight.delete(key); },
            function () { trailerInflight.delete(key); }
        );

        return promise;
    }

    function getCachedTrailer(id, type) {
        var kind = type === "tv" ? "tv" : "movie";
        return trailerCache.get(id + "_" + kind) || null;
    }


    /* ---------- genre names (cached once, used by search results) ---------- */

    var genreCache = null;

    function getGenres() {
        if (genreCache) {
            return Promise.resolve(genreCache);
        }

        return enqueue(function () {
            return Promise.all([
                request("/genre/movie/list"),
                request("/genre/tv/list")
            ]);
        }).then(function (results) {
            var map = {};
            var lists = [(results[0] && results[0].genres) || [],
                         (results[1] && results[1].genres) || []];

            lists.forEach(function (list) {
                list.forEach(function (genre) {
                    map[genre.id] = genre.name;
                });
            });

            genreCache = map;
            return map;
        }).catch(function () {
            return {}; /* search still works without genre names */
        });
    }


    /* ---------- search (movies + TV, via TMDB /search/multi) ---------- */

    function search(query) {
        if (hasKey() === false) {
            return Promise.reject(new Error("TMDB API key is not configured."));
        }

        return getGenres().then(function (genreNames) {
            return enqueue(function () {
                return request("/search/multi?query=" + encodeURIComponent(query));
            });
        }).then(function (data) {
            var results = (data && data.results) || [];

            return results
                .filter(function (r) {
                    return r.media_type === "movie" || r.media_type === "tv";
                })
                .map(function (r) {
                    var isSeries = r.media_type === "tv";
                    var date = isSeries ? r.first_air_date : r.release_date;
                    var genres = (r.genre_ids || [])
                        .map(function (id) { return genreNames[id]; })
                        .filter(Boolean);

                    return {
                        id: r.id,
                        type: isSeries ? "tv" : "movie",
                        title: r.title || r.name || "Unknown title",
                        poster: imageUrl("w500", r.poster_path),
                        year: (date || "").slice(0, 4) || "",
                        genres: genres
                    };
                });
        });
    }


    /* ---------- public API ---------- */

    window.TMDB = {
        isConfigured: hasKey,
        getDetails: getDetails,
        getCached: getCached,
        getTrailer: getTrailer,
        getCachedTrailer: getCachedTrailer,
        search: search
    };
})();