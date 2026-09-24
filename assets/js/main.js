(function () {
    "use strict";

    var MOVIES = window.MOVIES || {};
    var TMDB = window.TMDB || { isConfigured: function () { return false; } };
    var ArchiveAPI = window.ArchiveAPI || null;

    var NAVBAR = document.getElementById("navbar");
    var HAMBURGER = document.getElementById("hamburger");
    var NAV_LINKS = document.getElementById("nav-links");

    var MODAL = document.getElementById("modal");
    var MODAL_HERO = document.getElementById("modal-hero");
    var MODAL_BACKDROP = document.getElementById("modal-backdrop");
    var MODAL_TITLE = document.getElementById("modal-title");
    var MODAL_META = document.getElementById("modal-meta");
    var MODAL_DESC = document.getElementById("modal-description");
    var MODAL_GENRE = document.getElementById("modal-genre");
    var MODAL_CAST = document.getElementById("modal-cast");
    var MODAL_DIRECTOR = document.getElementById("modal-director");
    var MODAL_LANGUAGE = document.getElementById("modal-language");
    var MODAL_RATING = document.getElementById("modal-rating");
    var MODAL_FAV = document.getElementById("modal-fav");
    var MODAL_STATUS = document.getElementById("modal-status");
    var MODAL_ERROR = document.getElementById("modal-error");
    var MODAL_RETRY = document.getElementById("modal-retry");
    var MODAL_BODY = document.querySelector(".modal-body");

    /* Trailer (inside the details modal) */
    var TRAILER_SECTION = document.getElementById("trailer-section");
    var TRAILER_BOX = document.getElementById("trailer-box");
    var TRAILER_POSTER = document.getElementById("trailer-poster");
    var TRAILER_FRAME = document.getElementById("trailer-frame");
    var WATCH_BTN = document.getElementById("watch-btn");
    var MOVIE_UNAVAILABLE = document.getElementById("movie-unavailable");
    var COMMENTS_BTN = document.getElementById("comments-btn");

    /* Movie player overlay */
    var PLAYER = document.getElementById("player");
    var PLAYER_BOX = document.querySelector(".player-box");
    var PLAYER_STAGE = document.querySelector(".player-stage");
    var PLAYER_VIDEO = document.getElementById("player-video");
    var PLAYER_TITLE = document.getElementById("player-title");
    var PLAYER_BACK = document.getElementById("player-back");
    var PLAYER_CLOSE = document.getElementById("player-close");
    var PLAYER_UNAVAILABLE = document.getElementById("player-unavailable");
    var CTRL_PLAY = document.getElementById("ctrl-play");
    var CTRL_TIME = document.getElementById("ctrl-time");
    var CTRL_SEEK = document.getElementById("ctrl-seek");
    var CTRL_VOL = document.getElementById("ctrl-vol");
    var CTRL_MUTE = document.getElementById("ctrl-mute");
    var CTRL_FULL = document.getElementById("ctrl-full");

    var SEARCH_INPUT = document.querySelector(".search-box input");
    var SEARCH_ICON = document.querySelector(".search-box span");
    var SEARCH_BOX = document.querySelector(".search-box");
    var SEARCH_SECTION = document.getElementById("search-results");
    var SEARCH_ROW = document.getElementById("search-results-row");
    var SEARCH_STATUS = document.getElementById("search-status");
    var HERO = document.querySelector(".hero");
    var HOME_SECTIONS = Array.prototype.slice
        .call(document.querySelectorAll("main .movie-section"))
        .filter(function (section) { return section.id !== "search-results"; });

    var currentEntry = null;
    var currentData = null;

    /* Favorite / My List state (shared favorites.js layer) */
    var MyList = window.MyList || null;
    var MOVIES_IDS = window.MOVIES_IDS || { movie: {}, tv: {} };

    /* Continue Watching layer (shared continue.js); null on pages without it. */
    var ContinueWatching = window.ContinueWatching || null;


    /* ---------- navbar + mobile menu (hamburger + dropdown handled in profile.js) ---------- */

    function onScroll() {
        if (window.scrollY > 40) {
            NAVBAR.classList.add("scrolled");
        } else {
            NAVBAR.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();


    /* ---------- small helpers ---------- */

    function esc(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function entryFrom(el) {
        return {
            id: el.getAttribute("data-id") || null,
            type: el.getAttribute("data-type") || "",
            slug: el.getAttribute("data-slug") || null,
            archive: el.getAttribute("data-archive") || null
        };
    }

    function isCurrent(entry) {
        return !!(currentEntry &&
            (currentEntry.slug || currentEntry.id) === (entry.slug || entry.id));
    }

    /* Accepts either an API movie object or a static MOVIES record. */
    function toView(movie) {
        var trailerUrl = movie.trailerUrl || null;
        if (!trailerUrl && movie.trailer) {
            trailerUrl = "https://www.youtube.com/embed/" + movie.trailer;
        }
        return {
            title: movie.title || "Unknown title",
            poster: movie.poster || "",
            backdrop: movie.backdrop || movie.poster || "",
            description: movie.overview || movie.description || "No description available.",
            year: movie.year || "",
            genres: movie.genres || [],
            duration: movie.runtime || movie.duration || "",
            rating: typeof movie.rating === "number" ? movie.rating : null,
            cast: movie.cast || [],
            director: movie.director || "Unknown",
            language: movie.language || "\u2014",
            ageRating: movie.ageRating || null,
            trailerUrl: trailerUrl,
            movieUrl: movie.movieUrl || null,
            archiveId: movie.archiveId || null
        };
    }

    function staticView(entry) {
        var movie = entry.slug ? MOVIES[entry.slug] : null;
        if (!movie) {
            movie = MOVIES[entry.id];
        }
        return movie ? toView(movie) : null;
    }

    /* Backdrop fallback: original -> poster (if both exist). */
    function setBackdrop(img, view) {
        var options = [view.backdrop, view.poster].filter(function (p) { return p; });
        var index = options.length > 1 ? 1 : 0;

        img.onerror = function () {
            if (index > 0) {
                img.onerror = null;
                img.src = options[1];
                index = -1;
            } else {
                img.onerror = null;
            }
        };

        img.src = options[0];
    }


    /* ---------- favorites (hearts) ---------- */

    function isFav(id, slug, type) {
        return !!(MyList && MyList.has(id, slug, type));
    }

    function applyFavBtn(btn, added) {
        if (!btn) {
            return;
        }
        btn.textContent = added ? "\u2665" : "\u2661";
        btn.classList.toggle("favorited", added);
    }

    function updateModalFav(entry) {
        if (!currentEntry || !isCurrent(entry)) {
            return;
        }
        var added = isFav(entry.id, entry.slug, entry.type);
        MODAL_FAV.textContent = added ? "\u2665  In My List" : "\u2661  My List";
        MODAL_FAV.classList.toggle("active", added);
    }

    function syncCardHearts() {
        document.querySelectorAll(".movie-card").forEach(function (card) {
            var en = entryFrom(card);
            applyFavBtn(card.querySelector(".mini-plus"), isFav(en.id, en.slug, en.type));
        });
    }


    /* ---------- modal rendering ---------- */

    function showLoading() {
        MODAL_HERO.hidden = true;
        MODAL_BODY.hidden = true;
        MODAL_ERROR.hidden = true;
        MODAL_STATUS.hidden = false;
    }

    function showError() {
        MODAL_HERO.hidden = true;
        MODAL_BODY.hidden = true;
        MODAL_STATUS.hidden = true;
        MODAL_ERROR.hidden = false;
    }

    function render(view, entry) {
        if (!isCurrent(entry)) {
            return; /* stale response for an older movie \u2014 drop it */
        }
        currentData = view;

        MODAL_HERO.hidden = false;
        MODAL_BODY.hidden = false;
        MODAL_STATUS.hidden = true;
        MODAL_ERROR.hidden = true;

        MODAL_TITLE.textContent = view.title;
        setBackdrop(MODAL_BACKDROP, view);

        MODAL_META.innerHTML =
            (view.year ? "<span>" + esc(view.year) + "</span>" : "") +
            (view.ageRating ? '<span class="age-chip">' + esc(view.ageRating) + "</span>" : "") +
            (view.duration ? "<span>" + esc(view.duration) + "</span>" : "") +
            (view.genres && view.genres.length ?
                "<span>" + esc(view.genres.join(" / ")) + "</span>" : "") +
            (view.rating != null ?
                '<span class="rating-chip">\u2605 ' + view.rating.toFixed(1) + "</span>" : "");

        MODAL_DESC.textContent = view.description;
        MODAL_GENRE.textContent =
            view.genres && view.genres.length ? view.genres.join(", ") : "\u2014";
        MODAL_CAST.textContent = view.cast && view.cast.length ? view.cast.join(", ") : "\u2014";
        MODAL_DIRECTOR.textContent = view.director;
        MODAL_LANGUAGE.textContent = view.language;
        MODAL_RATING.textContent = view.rating != null ? view.rating.toFixed(1) + " / 10" : "N/A";

        /* trailer section is fresh for this movie */
        TRAILER_SECTION.classList.remove("playing");
        TRAILER_FRAME.src = "";
        TRAILER_POSTER.src = view.backdrop || view.poster || "";

        /* watch movie \u2014 shown when a real movie URL exists, or when the
         * free archive.org API can resolve one */
        if (view.movieUrl || view.archiveId || (ArchiveAPI && ArchiveAPI.enabled)) {
            WATCH_BTN.classList.remove("hidden");
            MOVIE_UNAVAILABLE.hidden = true;
        } else {
            WATCH_BTN.classList.add("hidden");
            MOVIE_UNAVAILABLE.hidden = false;
        }

        /* \u201CMovie\u201D becomes \u201CResume from mm:ss\u201D when progress exists. */
        var watchLabel = "\u25B6  Watch Movie";
        if (ContinueWatching && entry) {
            var resumeSec = ContinueWatching.resumeSeconds(entry);
            if (resumeSec > 0) {
                watchLabel = "\u25B6  Resume from " + fmtTime(resumeSec);
            }
        }
        WATCH_BTN.textContent = watchLabel;

        updateModalFav(entry);

        var cmKey = entry && (entry.slug || entry.id);
        if (COMMENTS_BTN) {
            COMMENTS_BTN.classList.toggle("hidden", !cmKey);
        }
    }

    function loadEntry(entry) {
        if (TMDB.isConfigured() && entry.id) {
            var cached = TMDB.getCached ? TMDB.getCached(entry.id, entry.type) : null;
            if (cached) {
                render(toView(cached), entry);
                return;
            }

            TMDB.getDetails(entry.id, entry.type).then(
                function (movie) {
                    render(toView(movie), entry);
                },
                function () {
                    renderStaticOrError(entry);
                }
            );
            return;
        }

        /* static store first (richer data for known cards) */
        var view = staticView(entry);
        if (view) {
            render(view, entry);
            return;
        }

        /* then the free archive.org API (search results, custom favorites) */
        if (entry.archive && ArchiveAPI) {
            ArchiveAPI.getDetails(entry.archive).then(
                function (movie) {
                    render(toView(movie), entry);
                },
                function () {
                    showError();
                }
            );
            return;
        }

        showError();
    }

    function renderStaticOrError(entry) {
        var view = staticView(entry);
        if (view) {
            render(view, entry);
        } else {
            showError();
        }
    }


    /* ---------- trailer playback ---------- */

    /* Accepts either a YouTube key or a full URL and embeds it. */
    function showTrailer(keyOrUrl) {
        if (!keyOrUrl) {
            return;
        }
        var url = /^https?:/.test(keyOrUrl) ? keyOrUrl : ("https://www.youtube.com/embed/" + keyOrUrl);
        var sep = url.indexOf("?") === -1 ? "?" : "&";
        TRAILER_FRAME.src = url + sep + "autoplay=1&rel=0&playsinline=1";
        TRAILER_SECTION.classList.add("playing");
    }

    function playTrailer() {
        var entry = currentEntry;
        if (!entry) {
            return;
        }

        var staticUrl = currentData ? currentData.trailerUrl : null;

        /* Not configured \u2014 only the static data store is available. */
        if (!TMDB.isConfigured() || !entry.id) {
            if (staticUrl) {
                showTrailer(staticUrl);
            }
            return;
        }

        var cached = TMDB.getCachedTrailer ? TMDB.getCachedTrailer(entry.id, entry.type) : null;
        if (cached !== null && cached !== undefined) {
            if (cached) {
                showTrailer(cached);
            } else if (staticUrl) {
                showTrailer(staticUrl);
            }
            return;
        }

        TMDB.getTrailer(entry.id, entry.type).then(
            function (key) {
                if (!isCurrent(entry)) {
                    return;
                }
                if (key) {
                    showTrailer(key);
                } else if (staticUrl) {
                    showTrailer(staticUrl);
                }
            },
            function () {
                if (isCurrent(entry) && staticUrl) {
                    showTrailer(staticUrl);
                }
            }
        );
    }


    /* ---------- open / close modal ---------- */

    function openDetails(entry) {
        if (!entry || (!entry.id && !entry.slug)) {
            return;
        }

        currentEntry = entry;
        currentData = null;

        MODAL.hidden = false;
        MODAL_HERO.classList.remove("playing");
        TRAILER_SECTION.classList.remove("playing");
        TRAILER_FRAME.src = "";
        closePlayer();
        document.body.style.overflow = "hidden";
        showLoading();

        loadEntry(entry);
    }

    function closeModal() {
        MODAL.hidden = true;
        MODAL_HERO.classList.remove("playing");
        TRAILER_SECTION.classList.remove("playing");
        TRAILER_FRAME.src = "";
        currentEntry = null;
        currentData = null;
        closePlayer();
        document.body.style.overflow = "";
    }

    document.getElementById("modal-close").addEventListener("click", closeModal);

    MODAL.addEventListener("click", function (e) {
        if (e.target === MODAL) {
            closeModal();
        }
    });

    MODAL_RETRY.addEventListener("click", function () {
        if (currentEntry) {
            openDetails(currentEntry);
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (!PLAYER.hidden) {
                closePlayer();
            } else if (!MODAL.hidden) {
                closeModal();
            }
            NAV_LINKS.classList.remove("open");
        }
    });

    TRAILER_BOX.addEventListener("click", playTrailer);
    WATCH_BTN.addEventListener("click", openPlayer);

    if (COMMENTS_BTN) {
        COMMENTS_BTN.addEventListener("click", function () {
            var key = currentEntry && (currentEntry.slug || currentEntry.id);
            if (key) {
                var base = /\/pages\//.test(location.pathname) ? "" : "pages/";
                location.href = base + "comments.html?movie=" + encodeURIComponent(key);
            }
        });
    }

    MODAL_FAV.addEventListener("click", function () {
        var entry = currentEntry;
        if (!entry || !MyList) {
            return;
        }
        MyList.toggle(entry.id, entry.slug, entry.type);
        updateModalFav(entry);
        syncCardHearts();
        renderMyList();
    });


    /* ---------- movie player ---------- */

    function fmtTime(sec) {
        if (!isFinite(sec)) {
            return "0:00";
        }
        sec = Math.max(0, Math.floor(sec));
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

/* Inline SVG controls - text glyphs like \u23F8/\u26F6 render as boxes
     * in many fonts. */
    var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>';
    var ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    var ICON_VOL_ON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 9v6h4l5 5V4L7 9H3zM13.5 12a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 13.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>';
    var ICON_VOL_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.9 8.9 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.96 8.96 0 0 0 3.69-7.13l1.79 1.79L21.73 19 23 17.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

    function updatePlayBtn() {
        CTRL_PLAY.innerHTML = PLAYER_VIDEO.paused ? ICON_PAUSE : ICON_PLAY;
    }

    function updateTime() {
        if (isFinite(PLAYER_VIDEO.duration)) {
            CTRL_SEEK.max = PLAYER_VIDEO.duration;
        }
        CTRL_SEEK.value = PLAYER_VIDEO.currentTime || 0;
        CTRL_TIME.textContent = fmtTime(PLAYER_VIDEO.currentTime) +
            (isFinite(PLAYER_VIDEO.duration) ? " / " + fmtTime(PLAYER_VIDEO.duration) : "");
    }

    function updateMuteIcon() {
        CTRL_MUTE.innerHTML =
            PLAYER_VIDEO.muted || PLAYER_VIDEO.volume === 0 ? ICON_VOL_OFF : ICON_VOL_ON;
    }

    function togglePlay() {
        if (PLAYER.hidden) {
            return;
        }
        if (PLAYER_VIDEO.paused) {
            PLAYER_VIDEO.play().catch(function () { /* ignore */ });
        } else {
            PLAYER_VIDEO.pause();
        }
        updatePlayBtn();
        showControls();
    }

    var controlsTimer = null;

    function showControls() {
        PLAYER_STAGE.classList.add("controls-visible");
        if (controlsTimer) {
            clearTimeout(controlsTimer);
        }
        controlsTimer = setTimeout(function () {
            if (!PLAYER_VIDEO.paused) {
                PLAYER_STAGE.classList.remove("controls-visible");
            }
        }, 2600);
    }

    /* Restores the saved position as soon as the stream's metadata loads. */
    function resumeSeekOnce() {
        if (ContinueWatching && currentEntry) {
            var rec = ContinueWatching.get(currentEntry);
            if (rec && isFinite(rec.pos) && rec.pos > 0) {
                var dur = isFinite(PLAYER_VIDEO.duration) ? PLAYER_VIDEO.duration : 0;
                PLAYER_VIDEO.currentTime = Math.min(rec.pos, dur > 0 ? dur * 0.99 : rec.pos);
            }
        }
        PLAYER_VIDEO.removeEventListener("loadedmetadata", resumeSeekOnce);
    }

    function startStream(url) {
        PLAYER_STAGE.classList.remove("unavailable-mode");
        PLAYER_UNAVAILABLE.hidden = true;
        PLAYER_UNAVAILABLE.classList.remove("visible");
        PLAYER_VIDEO.src = url;
        updatePlayBtn();
        updateTime();
        PLAYER_VIDEO.play().catch(function () { /* ignore */ });
        if (ContinueWatching && currentEntry && ContinueWatching.resumeSeconds(currentEntry) > 0) {
            PLAYER_VIDEO.addEventListener("loadedmetadata", resumeSeekOnce);
        }
        showControls();
    }

    function showUnavailable(message) {
        PLAYER_STAGE.classList.add("unavailable-mode");
        PLAYER_UNAVAILABLE.hidden = false;
        PLAYER_UNAVAILABLE.classList.add("visible");
        PLAYER_STAGE.classList.add("controls-visible");
        PLAYER_VIDEO.pause();
        PLAYER_VIDEO.removeAttribute("src");
        PLAYER_VIDEO.load();
        var p = PLAYER_UNAVAILABLE.querySelector("p");
        if (p) {
            p.textContent = message;
        }
    }

    function openPlayer() {
        var view = currentData;
        if (!view) {
            return;
        }

        PLAYER_TITLE.textContent = view.title;
        document.body.style.overflow = "hidden";
        PLAYER.hidden = false;

        /* Seed Continue Watching metadata so a partial watch can render. */
        if (ContinueWatching && currentEntry) {
            ContinueWatching.record(currentEntry, view);
        }

        /* a bundled file always starts right away */
        if (view.movieUrl) {
            startStream(view.movieUrl);
            return;
        }

        /* otherwise try to resolve a free stream via the archive.org API */
        var attempts = [];
        if (ArchiveAPI && ArchiveAPI.enabled) {
            if (view.archiveId) {
                attempts.push(ArchiveAPI.getStream(view.archiveId));
            }
            if (view.title) {
                attempts.push(ArchiveAPI.findStreamByTitle(view.title));
            }
        }

        if (!attempts.length) {
            showUnavailable("Full movie currently unavailable.");
            return;
        }

        showUnavailable("Looking for a free stream\u2026");

        var next = function (i) {
            if (i >= attempts.length) {
                showUnavailable("We could not find a free stream for this movie.");
                return;
            }
            attempts[i].then(
                function (url) {
                    if (!url) {
                        next(i + 1);
                        return;
                    }
                    startStream(url);
                },
                function () {
                    next(i + 1);
                }
            );
        };
        next(0);
    }

    function closePlayer() {
        if (!PLAYER.hidden && currentEntry) {
            saveProgress();
            renderContinueWatching();
        }
        PLAYER.hidden = true;
        PLAYER_STAGE.classList.remove("controls-visible");
        PLAYER_STAGE.classList.remove("unavailable-mode");
        PLAYER_UNAVAILABLE.hidden = true;
        PLAYER_UNAVAILABLE.classList.remove("visible");
        PLAYER_VIDEO.pause();
        if (PLAYER_VIDEO.getAttribute("src")) {
            PLAYER_VIDEO.removeAttribute("src");
            PLAYER_VIDEO.load();
        }
        if (MODAL.hidden) {
            document.body.style.overflow = "";
        }
    }

    PLAYER_BACK.addEventListener("click", closePlayer);
    PLAYER_CLOSE.addEventListener("click", function () {
        closePlayer();
        closeModal();
    });

    CTRL_PLAY.addEventListener("click", togglePlay);
    PLAYER_VIDEO.addEventListener("click", togglePlay);

    CTRL_SEEK.addEventListener("input", function () {
        var t = parseFloat(CTRL_SEEK.value);
        if (isFinite(t)) {
            PLAYER_VIDEO.currentTime = t;
        }
    });

    CTRL_VOL.addEventListener("input", function () {
        PLAYER_VIDEO.volume = parseFloat(CTRL_VOL.value) || 0;
        PLAYER_VIDEO.muted = PLAYER_VIDEO.volume === 0;
        updateMuteIcon();
    });

    CTRL_MUTE.addEventListener("click", function () {
        PLAYER_VIDEO.muted = !PLAYER_VIDEO.muted;
        if (!PLAYER_VIDEO.muted && PLAYER_VIDEO.volume === 0) {
            PLAYER_VIDEO.volume = 1;
        }
        CTRL_VOL.value = PLAYER_VIDEO.muted ? 0 : PLAYER_VIDEO.volume;
        updateMuteIcon();
    });

    CTRL_FULL.addEventListener("click", function () {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (PLAYER_BOX && PLAYER_BOX.requestFullscreen) {
            PLAYER_BOX.requestFullscreen().catch(function () { /* ignore */ });
        }
    });

    /* Saves playback progress to Continue Watching (throttled on timeupdate,
     * immediately on pause). */
    var saveTimer = null;

    function saveProgress() {
        if (!currentEntry || !ContinueWatching || PLAYER.hidden) {
            return;
        }
        ContinueWatching.update(
            currentEntry,
            PLAYER_VIDEO.currentTime,
            PLAYER_VIDEO.duration,
            currentData
        );
        ContinueWatching.paintAll();
    }

    PLAYER_VIDEO.addEventListener("play", updatePlayBtn);

    PLAYER_VIDEO.addEventListener("pause", function () {
        updatePlayBtn();
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
        }
        saveProgress();
        renderContinueWatching();
    });

    PLAYER_VIDEO.addEventListener("timeupdate", function () {
        updateTime();
        if (saveTimer) {
            return;
        }
        saveTimer = setTimeout(function () {
            saveTimer = null;
            saveProgress();
        }, 4000);
    });

    PLAYER_VIDEO.addEventListener("loadedmetadata", function () {
        CTRL_SEEK.max = PLAYER_VIDEO.duration;
        updateTime();
    });

    PLAYER_VIDEO.addEventListener("ended", function () {
        updatePlayBtn();
        updateTime();
        showControls();
        if (currentEntry && ContinueWatching) {
            ContinueWatching.remove(currentEntry);
            ContinueWatching.paintAll();
            renderContinueWatching();
        }
    });

    PLAYER_STAGE.addEventListener("mousemove", showControls);
    PLAYER_STAGE.addEventListener("click", showControls);
    PLAYER_STAGE.addEventListener("mouseleave", function () {
        if (!PLAYER_VIDEO.paused) {
            PLAYER_STAGE.classList.remove("controls-visible");
        }
    });


    /* profile dropdown click/escape handling lives in profile.js (all pages) */


    /* ---------- wire up cards + hero ---------- */

    document.querySelectorAll(".btn-play, .btn-more").forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (btn.hasAttribute("data-id") || btn.hasAttribute("data-slug")) {
                openDetails(entryFrom(btn));
            }
        });
    });

    function wireCard(card) {
        var entry = entryFrom(card);

        card.addEventListener("click", function () {
            openDetails(entry);
        });

        card.querySelectorAll(".mini-play, .mini-info").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                openDetails(entry);
            });
        });

        var favBtn = card.querySelector(".mini-plus");
        if (favBtn) {
            favBtn.setAttribute("aria-label", "Add or remove from My List");
            applyFavBtn(favBtn, isFav(entry.id, entry.slug, entry.type));

            favBtn.addEventListener("click", function (e) {
                if (!MyList) {
                    return;
                }
                e.stopPropagation();
                var en = entryFrom(card);
                MyList.toggle(en.id, en.slug, en.type);
                applyFavBtn(favBtn, isFav(en.id, en.slug, en.type));
                if (currentEntry && isCurrent(en)) {
                    updateModalFav(en);
                }
                renderMyList();
            });
        }
    }

    document.querySelectorAll(".movie-card").forEach(wireCard);


    /* ---------- search ---------- */

    var TV_SLUGS = [
        "stranger-things",
        "wednesday",
        "money-heist",
        "the-queens-gambit",
        "squid-game",
        "breaking-bad"
    ];

    var searchTimer = null;
    var lastQuery = "";
    var activeFilter = "all";
    var lastResults = [];

    var SEARCH_FILTERS = document.getElementById("search-filters");
    var SEARCH_SKELETON = document.getElementById("search-skeleton");
    var SEARCH_EMPTY = document.getElementById("search-empty");
    var SEARCH_EMPTY_HINT = document.getElementById("search-empty-hint");
    var SEARCH_CLEAR = document.getElementById("search-clear");

    /* Build one card with the exact existing card markup. */
    function buildCard(result) {
        var card = document.createElement("div");
        card.className = "movie-card";
        card.setAttribute("data-type", result.type || "movie");

        if (result.id) {
            card.setAttribute("data-id", result.id);
        }
        if (result.slug) {
            card.setAttribute("data-slug", result.slug);
        }
        if (result.archiveId) {
            card.setAttribute("data-archive", result.archiveId);
        }

        var img = document.createElement("img");
        img.src = result.poster || "";
        img.alt = result.title || "";
        card.appendChild(img);

        var metaParts = [];
        if (result.year) {
            metaParts.push(result.year);
        }
        if (result.genres && result.genres[0]) {
            metaParts.push(result.genres[0]);
        }

        var overlay = document.createElement("div");
        overlay.className = "card-overlay";
        overlay.innerHTML =
            '<div class="card-buttons">' +
            '<button class="mini-play">\u25B6</button>' +
            '<button class="mini-plus">\u2661</button>' +
            '<button class="mini-info">\u24D8</button>' +
            "</div>" +
            "<h4>" + esc(result.title) + "</h4>" +
            '<p class="card-meta">' + esc(metaParts.join(" \u00B7 ")) + "</p>";
        card.appendChild(overlay);

        wireCard(card);

        if (ContinueWatching) {
            ContinueWatching.paintCard(card, ContinueWatching.get({
                id: result.id,
                slug: result.slug,
                type: result.type
            }));
        }

        return card;
    }

    /* Search the static data store (used when no API key is configured). */
    function staticSearch(query) {
        var needle = query.toLowerCase();
        var results = [];

        Object.keys(MOVIES).forEach(function (slug) {
            var movie = MOVIES[slug];
            if (movie && movie.title && movie.title.toLowerCase().indexOf(needle) !== -1) {
                results.push({
                    id: null,
                    slug: slug,
                    type: TV_SLUGS.indexOf(slug) !== -1 ? "tv" : "movie",
                    title: movie.title,
                    poster: movie.poster,
                    year: movie.year,
                    genres: movie.genres || []
                });
            }
        });

        return results;
    }

    /* ---------- search helpers (skeleton, empty state, filters) ---------- */

    function setSearchLoading() {
        if (SEARCH_ROW) {
            SEARCH_ROW.innerHTML = "";
        }
        if (SEARCH_STATUS) {
            SEARCH_STATUS.hidden = true;
        }
        if (SEARCH_EMPTY) {
            SEARCH_EMPTY.hidden = true;
        }
        if (SEARCH_FILTERS) {
            SEARCH_FILTERS.innerHTML = "";
            SEARCH_FILTERS.hidden = true;
        }
        if (SEARCH_SKELETON) {
            SEARCH_SKELETON.innerHTML = "";
            for (var i = 0; i < 10; i += 1) {
                var sh = document.createElement("div");
                sh.className = "skeleton-card";
                SEARCH_SKELETON.appendChild(sh);
            }
            SEARCH_SKELETON.hidden = false;
        }
        HOME_SECTIONS.forEach(function (section) {
            section.hidden = true;
        });
        if (HERO) {
            HERO.hidden = true;
        }
        SEARCH_SECTION.hidden = false;
    }

    function hideSearchLoading() {
        if (SEARCH_SKELETON) {
            SEARCH_SKELETON.hidden = true;
            SEARCH_SKELETON.innerHTML = "";
        }
    }

    function showSearchEmpty(hasResults) {
        var msg = hasResults
            ? "No titles in this category."
            : "No results found for your search.";
        if (SEARCH_STATUS) {
            SEARCH_STATUS.textContent = msg;
        }
        if (SEARCH_EMPTY) {
            SEARCH_EMPTY.hidden = false;
            if (SEARCH_EMPTY_HINT) {
                SEARCH_EMPTY_HINT.textContent = hasResults
                    ? "Try a different filter, or search for another title."
                    : "Try a different title or a shorter keyword.";
            }
            if (SEARCH_STATUS) {
                SEARCH_STATUS.hidden = false;
            }
        } else if (SEARCH_STATUS) {
            SEARCH_STATUS.hidden = false;
        }
    }

    function passesFilter(result) {
        if (activeFilter === "all") {
            return true;
        }
        if (activeFilter === "movie") {
            return result.type !== "tv";
        }
        if (activeFilter === "tv") {
            return result.type === "tv";
        }
        if (activeFilter.indexOf("genre:") === 0) {
            var genre = activeFilter.slice(6);
            return (result.genres || []).indexOf(genre) !== -1;
        }
        return true;
    }

    /* Applies the active filter to the cached results and re-renders. */
    function applySearchFilter() {
        var results = lastResults;
        SEARCH_ROW.innerHTML = "";

        results.filter(passesFilter).forEach(function (result) {
            SEARCH_ROW.appendChild(buildCard(result));
        });

        if (results.length && SEARCH_FILTERS) {
            SEARCH_FILTERS.hidden = false;
        }

        if (results.filter(passesFilter).length === 0) {
            showSearchEmpty(results.length > 0);
        } else {
            if (SEARCH_EMPTY) {
                SEARCH_EMPTY.hidden = true;
            }
            if (SEARCH_STATUS) {
                SEARCH_STATUS.hidden = true;
            }
        }
    }

    /* Builds All / Movies / TV / genre chips from the current results. */
    function buildFilterChips(results) {
        if (!SEARCH_FILTERS) {
            return;
        }
        SEARCH_FILTERS.innerHTML = "";
        if (!results.length) {
            SEARCH_FILTERS.hidden = true;
            return;
        }

        var hasMovie = false;
        var hasTv = false;
        var genreCount = {};
        results.forEach(function (result) {
            if (result.type === "tv") {
                hasTv = true;
            } else {
                hasMovie = true;
            }
            (result.genres || []).slice(0, 3).forEach(function (g) {
                genreCount[g] = (genreCount[g] || 0) + 1;
            });
        });

        var chips = [{ key: "all", label: "All" }];
        if (hasMovie) {
            chips.push({ key: "movie", label: "Movies" });
        }
        if (hasTv) {
            chips.push({ key: "tv", label: "TV Shows" });
        }

        Object.keys(genreCount)
            .sort(function (a, b) { return genreCount[b] - genreCount[a]; })
            .slice(0, 8)
            .forEach(function (g) {
                chips.push({ key: "genre:" + g, label: g });
            });

        chips.forEach(function (chip) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "search-filter" + (chip.key === activeFilter ? " active" : "");
            btn.textContent = chip.label;
            btn.setAttribute("data-key", chip.key);
            btn.addEventListener("click", function () {
                activeFilter = chip.key;
                SEARCH_FILTERS.querySelectorAll(".search-filter").forEach(function (b) {
                    b.classList.toggle("active", b.getAttribute("data-key") === activeFilter);
                });
                applySearchFilter();
            });
            SEARCH_FILTERS.appendChild(btn);
        });

        SEARCH_FILTERS.hidden = false;
    }

    function renderSearchResults(query, results) {
        if (query !== lastQuery) {
            return; /* a newer search has started \u2014 drop this response */
        }

        hideSearchLoading();
        lastResults = results;
        activeFilter = "all";
        buildFilterChips(results);
        applySearchFilter();
    }

    function showHome() {
        lastQuery = "";
        activeFilter = "all";
        lastResults = [];
        hideSearchLoading();

        SEARCH_SECTION.hidden = true;
        SEARCH_ROW.innerHTML = "";

        if (HERO) {
            HERO.hidden = false;
        }

        if (SEARCH_FILTERS) {
            SEARCH_FILTERS.innerHTML = "";
            SEARCH_FILTERS.hidden = true;
        }
        if (SEARCH_EMPTY) {
            SEARCH_EMPTY.hidden = true;
        }
        if (SEARCH_STATUS) {
            SEARCH_STATUS.hidden = true;
        }

        HOME_SECTIONS.forEach(function (section) {
            section.hidden = false;
        });

        if (CONTINUE_SECTION) {
            renderContinueWatching();
        }
    }

    function runSearch(rawQuery) {
        var query = (rawQuery || "").trim();

        if (!query) {
            showHome();
            return;
        }

        lastQuery = query;
        activeFilter = "all";
        setSearchLoading();

        if (TMDB.isConfigured()) {
            TMDB.search(query).then(
                function (results) {
                    renderSearchResults(query, results);
                },
                function () {
                    renderSearchResults(query, staticSearch(query));
                }
            );
        } else if (ArchiveAPI && ArchiveAPI.enabled) {
            ArchiveAPI.search(query).then(
                function (results) {
                    if (query !== lastQuery) {
                        return;
                    }
                    if (results.length) {
                        renderSearchResults(query, results);
                    } else {
                        renderSearchResults(query, staticSearch(query));
                    }
                },
                function () {
                    renderSearchResults(query, staticSearch(query));
                }
            );
        } else {
            renderSearchResults(query, staticSearch(query));
        }
    }

    if (SEARCH_INPUT) {
        var SEARCH_SUGGEST = document.getElementById("search-suggest");

        /* Live suggestions from the on-site catalog only. Falls back to a
         * friendly "no results" row when nothing on the site matches. */
        function updateSuggestions(value) {
            if (!SEARCH_SUGGEST) {
                return;
            }

            var query = String(value || "").trim();
            if (!query) {
                SEARCH_SUGGEST.hidden = true;
                SEARCH_SUGGEST.innerHTML = "";
                return;
            }

            SEARCH_SUGGEST.innerHTML = "";
            var matches = staticSearch(query).slice(0, 7);

            if (!matches.length) {
                var none = document.createElement("li");
                none.className = "search-suggest-empty";
                none.textContent = "No search results for \u201C" + query + "\u201D";
                SEARCH_SUGGEST.appendChild(none);
                SEARCH_SUGGEST.hidden = false;
                return;
            }

            var i;
            for (i = 0; i < matches.length; i += 1) {
                (function (m) {
                    var li = document.createElement("li");
                    li.setAttribute("role", "option");

                    var name = document.createTextNode(m.title);
                    li.appendChild(name);

                    if (m.year) {
                        var year = document.createElement("span");
                        year.className = "search-suggest-meta";
                        year.textContent = String(m.year);
                        li.appendChild(year);
                    }

                    li.addEventListener("click", function () {
                        SEARCH_INPUT.value = m.title;
                        SEARCH_SUGGEST.hidden = true;
                        runSearch(m.title);
                    });

                    SEARCH_SUGGEST.appendChild(li);
                })(matches[i]);
            }

            SEARCH_SUGGEST.hidden = false;
        }

        function hideSuggestions() {
            if (SEARCH_SUGGEST) {
                SEARCH_SUGGEST.hidden = true;
            }
        }

        SEARCH_INPUT.addEventListener("input", function () {
            var value = SEARCH_INPUT.value;
            updateSuggestions(value);

            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                runSearch(value);
            }, 300);
        });

        SEARCH_INPUT.addEventListener("focus", function () {
            updateSuggestions(SEARCH_INPUT.value);
        });

        SEARCH_INPUT.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                clearTimeout(searchTimer);
                hideSuggestions();
                runSearch(SEARCH_INPUT.value);
            }

            if (e.key === "Escape") {
                hideSuggestions();
            }
        });

        document.addEventListener("click", function (e) {
            if (SEARCH_BOX && !SEARCH_BOX.contains(e.target)) {
                hideSuggestions();
            }
        });
    }

    if (SEARCH_ICON) {
        SEARCH_ICON.addEventListener("click", function () {
            clearTimeout(searchTimer);
            runSearch(SEARCH_INPUT ? SEARCH_INPUT.value : "");
        });
    }

    if (SEARCH_CLEAR) {
        SEARCH_CLEAR.addEventListener("click", function () {
            if (SEARCH_INPUT) {
                SEARCH_INPUT.value = "";
            }
            runSearch("");
        });
    }


    /* ---------- Continue Watching ---------- */

    var CONTINUE_SECTION = document.getElementById("continue-watching");
    var CONTINUE_ROW = document.getElementById("continue-watching-row");

    /* Renders every saved entry into the #continue-watching-row section. */
    function renderContinueWatching() {
        if (!CONTINUE_ROW || !ContinueWatching) {
            return;
        }

        CONTINUE_ROW.innerHTML = "";
        var items = ContinueWatching.getAll();

        if (CONTINUE_SECTION) {
            CONTINUE_SECTION.hidden = items.length === 0;
        }

        items.forEach(function (rec) {
            CONTINUE_ROW.appendChild(buildCard({
                id: rec.id || null,
                type: rec.type || "movie",
                slug: rec.slug || null,
                title: rec.title || "Unknown title",
                poster: rec.poster || "",
                year: rec.year || "",
                genres: rec.genres || []
            }));
        });
    }


    /* ---------- My List (Favorites) ---------- */

    var MY_LIST_ROW = document.getElementById("my-list-row");
    var MY_LIST_EMPTY = document.getElementById("my-list-empty");

    function isNumericId(value) {
        return /^\d+$/.test(String(value));
    }

    /* Resolve a stored favorite to static card data (offline fallback). */
    function resolveStaticFav(item) {
        var idKey = String(item.id);
        var slug = (MOVIES_IDS[item.type] || {})[idKey] || item.id;
        var movie = MOVIES[slug];
        if (!movie) {
            return null;
        }
        return {
            id: item.id,
            type: item.type,
            slug: slug,
            title: movie.title,
            poster: movie.poster,
            year: movie.year,
            genres: movie.genres || []
        };
    }

    /* Merge live API data with the static info (for the card's slug). */
    function favCardFromMovie(item, movie, staticInfo) {
        return {
            id: item.id,
            type: item.type,
            slug: staticInfo ? staticInfo.slug : null,
            title: movie.title,
            poster: movie.poster,
            year: movie.year,
            genres: movie.genres || []
        };
    }

    /* Renders every favorite into the #my-list-row section. */
    function renderMyList() {
        if (!MY_LIST_ROW || !MyList) {
            return;
        }

        var items = MyList.getAll();
        MY_LIST_ROW.innerHTML = "";

        if (items.length === 0) {
            MY_LIST_ROW.hidden = true;
            if (MY_LIST_EMPTY) {
                MY_LIST_EMPTY.hidden = false;
            }
            return;
        }

        if (MY_LIST_EMPTY) {
            MY_LIST_EMPTY.hidden = true;
        }
        MY_LIST_ROW.hidden = false;

        items.forEach(function (item) {
            var staticInfo = resolveStaticFav(item);

            /* Live API path for real ids. */
            if (TMDB.isConfigured() && isNumericId(item.id)) {
                var cached = TMDB.getCached ? TMDB.getCached(item.id, item.type) : null;
                if (cached) {
                    MY_LIST_ROW.appendChild(buildCard(favCardFromMovie(item, cached, staticInfo)));
                    return;
                }

                TMDB.getDetails(item.id, item.type).then(
                    function (movie) {
                        MY_LIST_ROW.appendChild(buildCard(favCardFromMovie(item, movie, staticInfo)));
                    },
                    function () {
                        if (staticInfo) {
                            MY_LIST_ROW.appendChild(buildCard(staticInfo));
                        }
                    }
                );
                return;
            }

            /* Offline/static mode (slug-based ids). */
            if (staticInfo) {
                MY_LIST_ROW.appendChild(buildCard(staticInfo));
            }
        });
    }


    /* ---------- enrich card titles/meta from the API (best-effort) ---------- */

    function populateCards() {
        document.querySelectorAll(".movie-card").forEach(function (card) {
            var entry = entryFrom(card);
            if (!TMDB.isConfigured() || !entry.id) {
                return;
            }

            TMDB.getDetails(entry.id, entry.type).then(
                function (movie) {
                    var titleEl = card.querySelector("h4");
                    var metaEl = card.querySelector(".card-meta");

                    if (titleEl && movie.title) {
                        titleEl.textContent = movie.title;
                    }
                    if (metaEl) {
                        var parts = [];
                        if (movie.year) {
                            parts.push(movie.year);
                        }
                        if (movie.genres && movie.genres[0]) {
                            parts.push(movie.genres[0]);
                        }
                        if (parts.length) {
                            metaEl.textContent = parts.join(" \u00B7 ");
                        }
                    }
                },
                function () { /* keep whatever is already shown */ }
            );
        });
    }

    populateCards();
    renderMyList();
    renderContinueWatching();
    if (ContinueWatching) {
        ContinueWatching.paintAll();
    }
})();