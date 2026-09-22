/*
 * Favorites ("My List") storage layer — shared by every page.
 *
 * Movies are identified by their unique TMDB id (falling back to the
 * internal slug for offline/static mode), never by title alone.
 * The list is persisted in localStorage under "netfliXXXFavs".
 *
 * Exposes: window.MyList
 */

(function () {
    "use strict";

    var KEY = "netfliXXXFavs";
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
        } catch (e) { /* storage unavailable — ignore */ }
    }

    /* Both the canonical id key and the legacy slug key, so older saved
     * favorites keep working and get migrated to the id-based key. */
    function entryKeys(id, slug, type) {
        var keys = [];
        var prefix = (type || "movie") + ":";
        if (id) {
            keys.push(prefix + id);
        }
        if (slug && String(slug) !== String(id)) {
            keys.push(prefix + slug);
        }
        return keys;
    }

    map = load();

    window.MyList = {

        has: function (id, slug, type) {
            var keys = entryKeys(id, slug, type);
            for (var i = 0; i < keys.length; i += 1) {
                if (map[keys[i]]) {
                    return true;
                }
            }
            return false;
        },

        /* Toggles a movie's favorite state and returns the new state.
         * Cleans up duplicate keys so the same movie can never be stored twice. */
        toggle: function (id, slug, type) {
            var keys = entryKeys(id, slug, type);
            if (!keys.length) {
                return false;
            }

            var active = false;
            for (var i = 0; i < keys.length; i += 1) {
                if (map[keys[i]]) {
                    active = true;
                    break;
                }
            }

            keys.forEach(function (k) { delete map[k]; });

            if (!active) {
                map[keys[0]] = true;
            }

            save();
            return !active;
        },

        /* Returns [{id, type}] for every stored favorite. */
        getAll: function () {
            var items = [];
            Object.keys(map).forEach(function (key) {
                if (!map[key]) {
                    return;
                }
                var i = key.indexOf(":");
                if (i === -1) {
                    return;
                }
                items.push({ type: key.slice(0, i), id: key.slice(i + 1) });
            });
            return items;
        }
    };
})();