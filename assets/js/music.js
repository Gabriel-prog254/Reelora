(function () {
    "use strict";

    var SEARCH = document.getElementById("music-search");
    var GENRES = document.getElementById("genre-chips");
    var GRID = document.getElementById("music-grid");
    var STATUS = document.getElementById("music-status");
    var SECTION_TITLE = document.getElementById("music-section-title");
    var LOAD_MORE = document.getElementById("music-load");
    var ALBUMS_SECTION = document.getElementById("music-albums-section");
    var ALBUMS_ROW = document.getElementById("music-albums");

    var PLAYER = document.getElementById("music-player");
    var NP_IMG = document.getElementById("np-img");
    var NP_TITLE = document.getElementById("np-title");
    var NP_ARTIST = document.getElementById("np-artist");
    var NP_TIME = document.getElementById("np-time");
    var NP_DUR = document.getElementById("np-dur");
    var TOGGLE = document.getElementById("np-toggle");
    var PREV = document.getElementById("np-prev");
    var NEXT = document.getElementById("np-next");
    var SEEK = document.getElementById("np-seek");
    var VOL = document.getElementById("np-vol");
    var AUDIO = document.getElementById("music-audio");

    var LIMIT = 50;

    var GENRE_QUERIES = [
        { label: "Pop", q: "pop" },
        { label: "Rock", q: "rock" },
        { label: "Hip-Hop", q: "hip-hop" },
        { label: "Electronic", q: "electronic" },
        { label: "R&B", q: "r&b" },
        { label: "Latin", q: "latin" },
        { label: "Jazz", q: "jazz" },
        { label: "Classical", q: "classical" }
    ];

    var FALLBACK_ARTISTS = ["SoundHelix", "Demo Band", "Cinemora Choir"];
    var FALLBACK_TRACKS = [];

    for (var i = 1; i <= 17; i++) {
        FALLBACK_TRACKS.push({
            id: "fh" + i,
            title: "SoundHelix Song " + i,
            artist: FALLBACK_ARTISTS[i % FALLBACK_ARTISTS.length],
            album: "Demo Disc " + (i % 3 + 1),
            cover: gradientCover(colorsFor(i), "♪"),
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-" + i + ".mp3",
            duration: 0
        });
    }

    function colorsFor(i) {
        var palettes = [
            ["#E50914", "#3b0b47"],
            ["#1db954", "#0a2a4a"],
            ["#7a1fbf", "#1a1a2e"],
            ["#f4880b", "#7a0b2e"],
            ["#0fb5c4", "#12315c"]
        ];
        return palettes[i % palettes.length];
    }

    var queue = [];
    var currentIndex = -1;
    var mode = "chart";
    var pageId = null;
    var pageTitle = "Trending Now";
    var nextIndex = 0;
    var hasMore = false;
    var statusTimer = null;
    var searchTimer = null;
    var cbCounter = 0;


    /* ---------- helpers ---------- */

    function gradientCover(colors, label) {
        var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>" +
            "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
            "<stop offset='0' stop-color='" + colors[0] + "'/><stop offset='1' stop-color='" + colors[1] + "'/>" +
            "</linearGradient></defs>" +
            "<rect width='200' height='200' fill='url(#g)'/>" +
            "<text x='100' y='132' font-family='Arial,Helvetica,sans-serif' font-size='96' fill='rgba(255,255,255,0.88)' text-anchor='middle'>" + label + "</text></svg>";
        return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    function esc(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function fmt(sec) {
        sec = Math.max(0, Math.round(Number(sec) || 0));
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

    function showStatus(message) {
        STATUS.textContent = message;
        STATUS.hidden = false;
        if (statusTimer) {
            clearTimeout(statusTimer);
        }
        statusTimer = setTimeout(function () {
            STATUS.hidden = true;
        }, 3000);
    }


    /* ---------- Deezer API (fetch with JSONP fallback) ---------- */

    function dzJSONP(url, callback) {
        var name = "__dzcb_" + (++cbCounter) + "_" + Date.now();
        var script = document.createElement("script");

        var done = false;
        function finish(err, data) {
            if (done) {
                return;
            }
            done = true;
            try {
                delete window[name];
            } catch (e) { /* ignore */ }
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            callback(err, data);
        }

        window[name] = function (data) {
            finish(null, data);
        };
        script.onerror = function () {
            finish(new Error("network"));
        };
        script.src = url + (url.indexOf("?") === -1 ? "?" : "&") + "callback=" + name;
        document.head.appendChild(script);
    }

    function dzGet(path, callback) {
        var url = "https://api.deezer.com" + path;
        var done = false;
        var settle = function (err, data) {
            if (!done) {
                done = true;
                callback(err, data);
            }
        };

        if (window.fetch) {
            fetch(url).then(function (r) {
                return r.json();
            }).then(function (data) {
                if (typeof data.error !== "undefined") {
                    settle(new Error((data.error && data.error.message) || "api"));
                } else {
                    settle(null, data);
                }
            }).catch(function () {
                dzJSONP(url, settle);
            });
        } else {
            dzJSONP(url, settle);
        }
    }

    function normalize(t) {
        return {
            id: t.id,
            title: t.title || "Unknown",
            artist: (t.artist && t.artist.name) || "Unknown",
            album: (t.album && t.album.title) || "",
            cover: (t.album && (t.album.cover_medium || t.album.cover || "")) || null,
            url: t.preview || null,
            duration: Number(t.duration) || 0
        };
    }


    /* ---------- loading pages of tracks ---------- */

    function basePath() {
        if (mode === "search") {
            return "/search?q=" + encodeURIComponent(pageId) + "&limit=" + LIMIT;
        }
        if (mode === "album") {
            return "/album/" + pageId + "/tracks?limit=" + LIMIT;
        }
        return "/chart/0/tracks?limit=" + LIMIT;
    }

    function applyPage() {
        dzGet(basePath() + "&index=" + nextIndex, function (err, data) {
            if (err || !data || !data.data || !data.data.length) {
                if (nextIndex === 0) {
                    showStatus("Couldn't reach the music service — showing demo tracks.");
                    queue = FALLBACK_TRACKS.slice();
                    nextIndex = queue.length;
                    hasMore = false;
                    rebuild("Demo Tracks");
                } else {
                    hasMore = false;
                    LOAD_MORE.hidden = true;
                    showStatus("That's all the tracks.");
                    rebuild();
                }
                return;
            }

            var fresh = data.data.map(normalize).filter(function (x) {
                return x.url;
            });
            var total = Number(data.total) || 0;

            if (nextIndex === 0) {
                queue = fresh;
            } else {
                queue = queue.concat(fresh);
            }

            hasMore = total ? (nextIndex + fresh.length < total) : fresh.length >= LIMIT;
            nextIndex += fresh.length;
            LOAD_MORE.hidden = !hasMore;
            rebuild();

            if (!queue.length) {
                showStatus("No tracks found.");
            }
        });
    }

    function rebuild(title) {
        if (title) {
            pageTitle = title;
        }
        SECTION_TITLE.textContent = pageTitle;
        GRID.innerHTML = "";

        if (!queue.length) {
            GRID.hidden = true;
            return;
        }

        GRID.hidden = false;
        queue.forEach(function (track, i) {
            GRID.appendChild(buildCard(track, i));
        });
        LOAD_MORE.hidden = !hasMore;
        markActive();
    }

    function loadTrending() {
        mode = "chart";
        pageId = null;
        nextIndex = 0;
        applyPage();
    }

    function loadSearch(query, title) {
        if (!query) {
            return loadTrending();
        }
        mode = "search";
        pageId = query;
        nextIndex = 0;
        pageTitle = title || 'Results for "' + query + '"';
        applyPage();
    }

    LOAD_MORE.addEventListener("click", function () {
        applyPage();
    });


    /* ---------- rendering ---------- */

    function buildCard(track, index) {
        var card = document.createElement("div");
        card.className = "music-track";
        card.setAttribute("data-index", String(index));

        var cover = document.createElement("div");
        cover.className = "music-track-cover";

        var img = document.createElement("img");
        img.loading = "lazy";
        img.alt = esc(track.title);
        img.src = track.cover || gradientCover(colorsFor(index), "♪");
        cover.appendChild(img);

        var play = document.createElement("button");
        play.type = "button";
        play.className = "music-track-play";
        play.setAttribute("aria-label", "Play " + esc(track.title));
        play.textContent = "▶";
        cover.appendChild(play);

        var info = document.createElement("div");
        info.className = "music-track-info";
        var h4 = document.createElement("h4");
        h4.textContent = track.title;
        var p = document.createElement("p");
        p.textContent = track.artist;
        info.appendChild(h4);
        info.appendChild(p);

        var dur = document.createElement("span");
        dur.className = "music-track-dur";
        dur.textContent = track.duration > 0 ? fmt(track.duration) : "";
        info.appendChild(dur);

        card.appendChild(cover);
        card.appendChild(info);

        var handler = function () {
            if (!track.url) {
                return showStatus("No preview available for this track.");
            }
            playIndex(index);
        };
        play.addEventListener("click", function (e) {
            e.stopPropagation();
            handler();
        });
        card.addEventListener("click", handler);

        return card;
    }

    function markActive() {
        GRID.querySelectorAll(".music-track").forEach(function (card) {
            var i = Number(card.getAttribute("data-index"));
            card.classList.toggle("is-current", i === currentIndex);
        });
    }


    /* ---------- Top Albums ---------- */

    function loadAlbums() {
        dzGet("/chart/0/albums?limit=10", function (err, data) {
            if (err || !data || !data.data || !data.data.length) {
                ALBUMS_SECTION.hidden = true;
                return;
            }
            var albums = data.data
                .filter(function (a) { return a.id && a.title; })
                .slice(0, 10)
                .map(function (a) {
                    return {
                        id: a.id,
                        title: a.title,
                        artist: (a.artist && a.artist.name) || "",
                        cover: a.cover_medium || a.cover || a.cover_small || null
                    };
                });

            if (!albums.length) {
                ALBUMS_SECTION.hidden = true;
                return;
            }

            ALBUMS_SECTION.hidden = false;
            ALBUMS_ROW.innerHTML = "";
            albums.forEach(function (album) {
                ALBUMS_ROW.appendChild(buildAlbum(album));
            });
        });
    }

    function buildAlbum(album) {
        var card = document.createElement("div");
        card.className = "album-card";
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", "Play album " + esc(album.title));

        var img = document.createElement("img");
        img.loading = "lazy";
        img.alt = esc(album.title);
        img.src = album.cover || gradientCover(colorsFor(album.id), "♪");

        var h4 = document.createElement("h4");
        h4.textContent = album.title;
        var p = document.createElement("p");
        p.textContent = album.artist;

        card.appendChild(img);
        card.appendChild(h4);
        card.appendChild(p);

        var open = function () {
            mode = "album";
            pageId = String(album.id);
            nextIndex = 0;
            pageTitle = album.title;
            applyPage();
            document.getElementById("music-section").scrollIntoView({ behavior: "smooth", block: "start" });
        };

        card.addEventListener("click", open);
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
            }
        });

        return card;
    }


    /* ---------- player ---------- */

    function playIndex(index) {
        var track = queue[index];
        if (!track || !track.url) {
            return showStatus("No preview available for this track.");
        }

        currentIndex = index;
        AUDIO.src = track.url;
        NP_IMG.src = track.cover || gradientCover(colorsFor(index), "♪");
        NP_TITLE.textContent = track.title;
        NP_ARTIST.textContent = track.artist;
        PLAYER.hidden = false;
        SEEK.max = track.duration > 0 ? track.duration : 100;
        NP_TIME.textContent = "0:00";
        NP_DUR.textContent = track.duration > 0 ? fmt(track.duration) : "";
        markActive();

        AUDIO.play().catch(function () {
            showStatus("Could not play this preview. Try another track.");
        });
    }

    function step(delta) {
        if (!queue.length) {
            return;
        }
        var next = currentIndex + delta;
        if (next < 0) {
            next = queue.length - 1;
        }
        if (next >= queue.length) {
            next = 0;
        }
        playIndex(next);
    }

    TOGGLE.addEventListener("click", function () {
        if (AUDIO.paused) {
            AUDIO.play().catch(function () { /* ignore */ });
        } else {
            AUDIO.pause();
        }
    });

    PREV.addEventListener("click", function () {
        step(-1);
    });
    NEXT.addEventListener("click", function () {
        step(1);
    });

    AUDIO.addEventListener("play", function () {
        TOGGLE.textContent = "⏸";
    });
    AUDIO.addEventListener("pause", function () {
        TOGGLE.textContent = "▶";
    });
    AUDIO.addEventListener("ended", function () {
        step(1);
    });

    AUDIO.addEventListener("loadedmetadata", function () {
        if (AUDIO.duration && isFinite(AUDIO.duration)) {
            SEEK.max = AUDIO.duration;
            NP_DUR.textContent = fmt(AUDIO.duration);
        }
    });

    AUDIO.addEventListener("timeupdate", function () {
        if (!SEEK.dataset.scrubbing) {
            SEEK.value = AUDIO.currentTime;
            NP_TIME.textContent = fmt(AUDIO.currentTime);
        }
    });

    SEEK.addEventListener("input", function () {
        SEEK.dataset.scrubbing = "1";
        try {
            AUDIO.currentTime = Number(SEEK.value);
        } catch (e) { /* ignore */ }
    });
    SEEK.addEventListener("change", function () {
        delete SEEK.dataset.scrubbing;
    });

    VOL.addEventListener("input", function () {
        AUDIO.volume = Number(VOL.value) / 100;
    });


    /* ---------- search + genres ---------- */

    GENRE_QUERIES.forEach(function (g) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "genre-chip";
        chip.textContent = g.label;
        chip.addEventListener("click", function () {
            SEARCH.value = g.label;
            loadSearch(g.q, "Looking for " + g.label);
        });
        GENRES.appendChild(chip);
    });

    SEARCH.addEventListener("input", function () {
        if (searchTimer) {
            clearTimeout(searchTimer);
        }
        searchTimer = setTimeout(function () {
            loadSearch(SEARCH.value.trim(), null);
        }, 350);
    });

    SEARCH.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
            loadSearch(SEARCH.value.trim(), null);
        }
    });


    /* ---------- init ---------- */

    loadTrending();
    loadAlbums();
    AUDIO.volume = Number(VOL.value) / 100;
})();