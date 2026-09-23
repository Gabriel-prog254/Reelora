/*
 * Continue Watching storage layer \u2014 shared by the pages that play movies.
 *
 * Tracks the playback position of movies/TV so cards can show a progress bar
 * and the player can resume where you left off. Persisted in localStorage
 * under "reeloraProgress".
 *
 * Exposes: window.ContinueWatching
 */

(function () {
    "use strict";

    var KEY = "reeloraProgress";
    var map = null;

    function load() {
        try {
            var raw = JSON.parse(localStorage.getItem(KEY));
            if (raw && typeof raw === "object" && !Array.isArray(raw)) {
                return raw;
            }
        } catch (e) { /* ignore */ }
        return {};
    }

    function save() {
        try {
            localStorage.setItem(KEY, JSON.stringify(map));
        } catch (e) { /* storage unavailable \u2014 ignore */ }
    }

    /* Both the canonical id key and the legacy slug key, so an entry saved
     * under one identifier stays connected to the same movie. */
    function entryKeys(entry) {
        var keys = [];
        var prefix = (entry.type || "movie") + ":";
        if (entry.id) {
            keys.push(prefix + entry.id);
        }
        if (entry.slug && String(entry.slug) !== String(entry.id)) {
            keys.push(prefix + entry.slug);
        }
        return keys;
    }

    function keyFor(entry) {
        var keys = entryKeys(entry);
        for (var i = 0; i < keys.length; i += 1) {
            if (map[keys[i]]) {
                return keys[i];
            }
        }
        return keys[0];
    }

    function entryFrom(el) {
        return {
            id: el.getAttribute("data-id") || null,
            type: el.getAttribute("data-type") || "movie",
            slug: el.getAttribute("data-slug") || null
        };
    }

    /* Progress counts as "resumable" only when the movie has really started
     * but is nowhere near the end. */
    function resumable(rec) {
        return !!rec &&
            typeof rec.pos === "number" && rec.pos > 30 &&
            typeof rec.dur === "number" && rec.dur > 60 &&
            rec.pos < rec.dur * 0.95;
    }

    map = load();

    window.ContinueWatching = {

        /* Returns the saved record for an entry, or null. */
        get: function (entry) {
            if (!entry) {
                return null;
            }
            var rec = map[keyFor(entry)];
            return rec && typeof rec === "object" ? rec : null;
        },

        /* Records identifying/poster data before playback begins so a
         * partially-watched item always has a card to render. */
        record: function (entry, view) {
            if (!entry) {
                return;
            }
            var rec = map[keyFor(entry)] || {};
            rec.id = entry.id || null;
            rec.slug = entry.slug || null;
            rec.type = entry.type || "movie";
            if (view) {
                rec.title = view.title;
                rec.poster = view.poster;
                rec.backdrop = view.backdrop || view.poster || "";
                rec.year = view.year;
                rec.genres = view.genres || [];
                rec.duration = view.duration;
            }
            map[keyFor(entry)] = rec;
            save();
        },

        /* Saves the current playback position. Deduplicates slug/id keys. */
        update: function (entry, pos, dur, view) {
            if (!entry || !isFinite(pos)) {
                return;
            }
            var rec = map[keyFor(entry)] || {};
            rec.id = entry.id || null;
            rec.slug = entry.slug || null;
            rec.type = entry.type || "movie";
            rec.pos = Math.max(0, pos);
            if (isFinite(dur)) {
                rec.dur = dur;
                if (pos >= dur * 0.95) {
                    entryKeys(entry).forEach(function (k) { delete map[k]; });
                    save();
                    return;
                }
            }
            if (view) {
                rec.title = view.title;
                rec.poster = view.poster;
                rec.backdrop = view.backdrop || view.poster || "";
                rec.year = view.year;
                rec.genres = view.genres || [];
                rec.duration = view.duration;
            }
            rec.updated = Date.now();
            map[keyFor(entry)] = rec;
            save();
        },

        /* Drops the saved progress for an entry (movie finished). */
        remove: function (entry) {
            if (!entry) {
                return;
            }
            entryKeys(entry).forEach(function (k) { delete map[k]; });
            save();
        },

        /* The position to resume from (0 when nothing useful is stored). */
        resumeSeconds: function (entry) {
            var rec = this.get(entry);
            return resumable(rec) ? rec.pos : 0;
        },

        /* Every resumable entry, most recent first. */
        getAll: function () {
            var items = [];
            Object.keys(map).forEach(function (k) {
                var rec = map[k];
                if (rec && typeof rec === "object" && resumable(rec)) {
                    items.push(rec);
                }
            });
            items.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
            return items;
        },

        /* Adds a progress bar across the bottom of a card's poster. Safe to
         * call multiple times on the same card. */
        paintCard: function (card, rec) {
            if (!card) {
                return;
            }
            var track = card.querySelector(".cw-track");
            var has = rec && typeof rec.pos === "number" && rec.pos > 0;
            if (!has) {
                if (track) {
                    track.parentNode.removeChild(track);
                }
                card.classList.remove("cw-resume");
                return;
            }
            if (!track) {
                track = document.createElement("span");
                track.className = "cw-track";
                track.appendChild(document.createElement("i"));
                card.appendChild(track);
            }
            var pct = isFinite(rec.dur) && rec.dur > 0
                ? Math.min(100, Math.round((rec.pos / rec.dur) * 100))
                : 0;
            track.querySelector("i").style.width = pct + "%";
            card.classList.toggle("cw-resume", resumable(rec));
        },

        /* Paints every card that has saved progress (used on page load). */
        paintAll: function () {
            var self = this;
            document.querySelectorAll(".movie-card").forEach(function (card) {
                self.paintCard(card, self.get(entryFrom(card)));
            });
        }
    };
})();