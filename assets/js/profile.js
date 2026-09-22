/*
 * Profile session + notifications badge — shared by every page.
 *
 * Keeps the profile list and the active profile in localStorage and updates
 * the navbar avatar/name and the notifications bell dot. Loaded on every
 * page after branding.js (before any page-specific script).
 *
 * Exposes: window.Profiles, window.Notifications
 */

(function () {
    "use strict";

    var SITE_NAME = window.SITE_NAME || "CINEMORA";

    var PROFILES_KEY = "cinemoraProfiles";
    var ACTIVE_KEY = "cinemoraProfile";
    var NOTIFS_KEY = "cinemoraNotifs";
    var MAX_PROFILES = 5;

    var AVATAR_IDS = [12, 26, 30, 33, 42, 51, 59, 68, 44, 16];

    function avatar(id) {
        return "https://i.pravatar.cc/56?img=" + id;
    }

    var DEFAULT_PROFILES = [
        { name: "Default", img: avatar(12) },
        { name: "Kids", img: avatar(26) },
        { name: "Gamer", img: avatar(30) },
        { name: "Movie Buff", img: avatar(33) }
    ];

    function read(key, fallback) {
        try {
            var value = JSON.parse(localStorage.getItem(key));
            if (value != null) {
                return value;
            }
        } catch (e) { /* ignore */ }
        return fallback;
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* ignore */ }
    }

    function getProfiles() {
        var list = read(PROFILES_KEY, null);
        if (!list || !list.length) {
            write(PROFILES_KEY, DEFAULT_PROFILES);
            if (!read(ACTIVE_KEY, null)) {
                write(ACTIVE_KEY, DEFAULT_PROFILES[0].name);
            }
            return DEFAULT_PROFILES;
        }
        return list;
    }

    function getCurrent() {
        var list = getProfiles();
        var name = read(ACTIVE_KEY, "");
        for (var i = 0; i < list.length; i += 1) {
            if (list[i].name === name) {
                return list[i];
            }
        }
        return list[0];
    }

    function getNotifications() {
        var now = Date.now();
        var list = read(NOTIFS_KEY, null);
        if (!list || !list.length) {
            var seeded = [
                { id: "n1", icon: "🎵", title: "Music is live", body: "Stream free song previews in the brand-new Music section.", time: now - 7200e3, read: false },
                { id: "n2", icon: "✨", title: "10 more movies watchable", body: "Public-domain classics like Night of the Living Dead now stream for free.", time: now - 86400e3, read: false },
                { id: "n3", icon: "💬", title: "Comments are here", body: "Share your thoughts on any movie in the new Comments section.", time: now - 172800e3, read: true },
                { id: "n4", icon: "🌸", title: "Welcome to " + SITE_NAME, body: "Browse, comment, save to your list and enjoy!", time: now - 259200e3, read: true }
            ];
            write(NOTIFS_KEY, seeded);
            return seeded;
        }
        return list;
    }

    function unreadNotifCount() {
        return getNotifications().filter(function (n) { return !n.read; }).length;
    }

    /* Keeps the navbar avatar, dropdown name and bell badge in sync. */
    function updateUI() {
        var me = getCurrent();

        var topImg = document.querySelector(".profile > img");
        if (topImg) {
            topImg.src = me.img;
        }

        var nameBlock = document.querySelector(".profile-menu .profile-name");
        if (nameBlock) {
            nameBlock.innerHTML = '<img src="' + me.img + '" alt="Profile picture"><span>' + me.name + "</span>";
        }

        var label = document.querySelector("[data-profile-label]");
        if (label) {
            label.textContent = me.name;
        }

        var bell = document.getElementById("bell");
        var dot = bell ? bell.querySelector(".notif-dot") : null;
        var count = unreadNotifCount();
        if (dot) {
            dot.hidden = count === 0;
            dot.textContent = count;
        }
    }

    /* Shared navbar behaviour — hamburger, scrolled state, profile dropdown.
     * Lives here so every page (even ones without main.js) works the same. */
    function wireNav() {
        var NAVBAR = document.getElementById("navbar");
        var HAMBURGER = document.getElementById("hamburger");
        var NAV_LINKS = document.getElementById("nav-links");

        function onScroll() {
            if (NAVBAR) {
                NAVBAR.classList.toggle("scrolled", window.scrollY > 40);
            }
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        if (HAMBURGER && NAV_LINKS) {
            HAMBURGER.addEventListener("click", function () {
                NAV_LINKS.classList.toggle("open");
            });

            NAV_LINKS.addEventListener("click", function (e) {
                if (e.target && e.target.tagName === "A") {
                    NAV_LINKS.classList.remove("open");
                }
            });
        }

        var PROFILE = document.querySelector(".profile");
        if (PROFILE) {
            PROFILE.addEventListener("click", function (e) {
                e.stopPropagation();
                PROFILE.classList.toggle("open");
            });

            document.addEventListener("click", function (e) {
                if (!PROFILE.contains(e.target)) {
                    PROFILE.classList.remove("open");
                }
            });

            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    PROFILE.classList.remove("open");
                }
            });
        }
    }

    window.Profiles = {
        MAX: MAX_PROFILES,
        avatar: avatar,
        avatarIds: AVATAR_IDS,
        all: getProfiles,
        get: getCurrent,
        activate: function (name) {
            var list = getProfiles();
            for (var i = 0; i < list.length; i += 1) {
                if (list[i].name === name) {
                    write(ACTIVE_KEY, name);
                    updateUI();
                    return list[i];
                }
            }
            return getCurrent();
        },
        add: function (name, img) {
            var list = getProfiles();
            if (list.length >= MAX_PROFILES) {
                return false;
            }
            var clean = String(name || "").trim();
            if (!clean) {
                return false;
            }
            for (var i = 0; i < list.length; i += 1) {
                if (list[i].name === clean) {
                    return false;
                }
            }
            list.push({
                name: clean.slice(0, 20),
                img: img || avatar(AVATAR_IDS[list.length % AVATAR_IDS.length])
            });
            write(PROFILES_KEY, list);
            return true;
        },
        remove: function (name) {
            var list = getProfiles();
            if (list.length <= 1) {
                return false;
            }
            list = list.filter(function (p) { return p.name !== name; });
            write(PROFILES_KEY, list);
            if (read(ACTIVE_KEY, "") === name) {
                write(ACTIVE_KEY, list[0].name);
            }
            updateUI();
            return true;
        }
    };

    window.Notifications = {
        all: getNotifications,
        unread: unreadNotifCount,
        markRead: function (id) {
            var list = read(NOTIFS_KEY, getNotifications());
            list.forEach(function (n) {
                if (String(n.id) === String(id)) {
                    n.read = true;
                }
            });
            write(NOTIFS_KEY, list);
            updateUI();
        },
        markAllRead: function () {
            var list = read(NOTIFS_KEY, getNotifications());
            list.forEach(function (n) { n.read = true; });
            write(NOTIFS_KEY, list);
            updateUI();
        },
        clear: function () {
            write(NOTIFS_KEY, []);
            updateUI();
        }
    };

    updateUI();
    wireNav();
})();