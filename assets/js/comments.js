(function () {
    "use strict";

    var MOVIES = window.MOVIES || {};
    var Profiles = window.Profiles || null;

    var KEY = "cinemoraComments";

    var SEARCH = document.getElementById("cm-search");
    var TITLES = document.getElementById("cm-titles");
    var PICK = document.getElementById("cm-thread-pick");
    var THREAD = document.getElementById("cm-thread");
    var THREAD_TITLE = document.getElementById("cm-thread-title");
    var THREAD_SUB = document.getElementById("cm-thread-sub");
    var MY_AVATAR = document.getElementById("cm-my-avatar");
    var NEW_COMMENT = document.getElementById("cm-new");
    var POST_BTN = document.getElementById("cm-post");
    var COMMENTS = document.getElementById("cm-comments");
    var TOAST = document.getElementById("toast");

    var currentSlug = null;
    var filter = "";
    var data = {};

    function esc(text) {
        return String(text == null ? "" : text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function timeAgo(ts) {
        var diff = Date.now() - ts;
        if (!isFinite(diff) || diff < 0) {
            return "";
        }
        var min = Math.floor(diff / 60000);
        if (min < 1) {
            return "just now";
        }
        if (min < 60) {
            return min + "m ago";
        }
        var hours = Math.floor(min / 60);
        if (hours < 24) {
            return hours + "h ago";
        }
        var days = Math.floor(hours / 24);
        return days === 1 ? "yesterday" : days + "d ago";
    }

    function read(key, fallback) {
        try {
            var value = JSON.parse(localStorage.getItem(key));
            if (value != null) {
                return value;
            }
        } catch (e) { /* ignore */ }
        return fallback;
    }

    function saveAll() {
        try {
            localStorage.setItem(KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    /* seed a few comments so the page feels alive on first visit */
    function seed() {
        if (localStorage.getItem(KEY)) {
            return;
        }
        var now = Date.now();
        var seeded = {};
        seeded["the-dark-knight"] = [
            { id: "c1", author: "Movie Buff", avatar: Profiles.avatar(68), text: "Heath Ledger's Joker is still unmatched. A masterpiece.", time: now - 6 * 3600e3, likedBy: {} },
            { id: "c2", author: "Gamer", avatar: Profiles.avatar(30), text: "The opening bank heist scene is perfect filmmaking.", time: now - 2 * 3600e3, likedBy: {} }
        ];
        seeded["pulp-fiction"] = [
            { id: "c3", author: "Kids", avatar: Profiles.avatar(26), text: "Not for kids, but what an incredible script. The timeline trick blew my mind.", time: now - 5 * 3600e3, likedBy: {} }
        ];
        seeded["the-general"] = [
            { id: "c4", author: "Movie Buff", avatar: Profiles.avatar(68), text: "Keaton did all of this with no digital effects. Mind-blowing stunts.", time: now - 8 * 3600e3, likedBy: {} }
        ];
        data = seeded;
        saveAll();
    }

    function load() {
        var stored = read(KEY, null);
        if (stored && typeof stored === "object") {
            data = stored;
        } else {
            data = {};
            seed();
        }
    }

    function commentsFor(slug) {
        if (!data[slug]) {
            data[slug] = [];
        }
        return data[slug];
    }

    function order() {
        return Object.keys(MOVIES);
    }

    function renderTitles() {
        var needle = filter.toLowerCase();

        TITLES.innerHTML = "";

        order().forEach(function (slug) {
            var movie = MOVIES[slug];
            if (!movie || (needle && movie.title.toLowerCase().indexOf(needle) === -1)) {
                return;
            }

            var count = (data[slug] || []).length;

            var row = document.createElement("button");
            row.type = "button";
            row.className = "cm-title" + (slug === currentSlug ? " active" : "");

            var img = document.createElement("img");
            img.src = movie.poster || "";
            img.alt = movie.title || "";
            img.addEventListener("error", function () { img.style.visibility = "hidden"; });

            var txt = document.createElement("div");
            txt.className = "cm-title-txt";
            txt.innerHTML = "<h4>" + esc(movie.title) + "</h4>" +
                '<span class="cm-count">' + (count ? count + " comment" + (count === 1 ? "" : "s") : "No comments yet") + "</span>";

            row.appendChild(img);
            row.appendChild(txt);

            row.addEventListener("click", function () {
                openThread(slug);
            });

            TITLES.appendChild(row);
        });
    }

    function openThread(slug) {
        currentSlug = slug;
        var movie = MOVIES[slug];

        PICK.hidden = true;
        THREAD.hidden = false;

        THREAD_TITLE.textContent = movie.title;
        THREAD_SUB.textContent = (movie.year || "") + " \u00B7 " + (movie.genres && movie.genres.length ? movie.genres.join(", ") : "Movies");

        var me = Profiles ? Profiles.get() : null;
        if (me) {
            MY_AVATAR.src = me.img;
        }

        NEW_COMMENT.value = "";
        renderTitles();
        renderComments();
        NEW_COMMENT.focus();
    }

    function renderComments() {
        var list = commentsFor(currentSlug);
        var me = Profiles ? Profiles.get() : null;
        var myName = me ? me.name : "";

        COMMENTS.innerHTML = "";

        list.slice().sort(function (a, b) { return (b.time || 0) - (a.time || 0); }).forEach(function (c) {
            var row = document.createElement("div");
            row.className = "comment-item";

            var avatar = document.createElement("img");
            avatar.src = c.avatar || "";
            avatar.alt = c.author || "";

            var body = document.createElement("div");
            body.style.flex = "1";

            var head = document.createElement("div");
            head.className = "comment-head";
            head.innerHTML = '<span class="comment-author' + (c.author === myName ? " me" : "") + '">' + esc(c.author) + "</span>" +
                '<span class="comment-time">' + timeAgo(c.time) + "</span>";

            var text = document.createElement("div");
            text.className = "comment-text";
            text.textContent = c.text;

            var actions = document.createElement("div");
            actions.className = "comment-actions";

            var likeBtn = document.createElement("button");
            likeBtn.type = "button";
            var liked = !!(c.likedBy && c.likedBy[myName]);
            likeBtn.textContent = (liked ? "\u2665 " : "\u2661 ") + Object.keys(c.likedBy || {}).length;
            likeBtn.classList.toggle("liked", liked);
            likeBtn.addEventListener("click", function () {
                if (!myName) {
                    return;
                }
                if (!c.likedBy) {
                    c.likedBy = {};
                }
                if (c.likedBy[myName]) {
                    delete c.likedBy[myName];
                } else {
                    c.likedBy[myName] = true;
                }
                saveAll();
                renderComments();
            });
            actions.appendChild(likeBtn);

            if (myName && c.author === myName) {
                var delBtn = document.createElement("button");
                delBtn.type = "button";
                delBtn.textContent = "Delete";
                delBtn.addEventListener("click", function () {
                    data[currentSlug] = data[currentSlug].filter(function (x) { return x.id !== c.id; });
                    saveAll();
                    renderComments();
                    renderTitles();
                });
                actions.appendChild(delBtn);
            }

            body.appendChild(head);
            body.appendChild(text);
            body.appendChild(actions);

            row.appendChild(avatar);
            row.appendChild(body);
            COMMENTS.appendChild(row);
        });

        if (!list.length) {
            var empty = document.createElement("p");
            empty.className = "cm-nothing";
            empty.textContent = "No comments yet. Be the first!";
            COMMENTS.appendChild(empty);
        }
    }

    POST_BTN.addEventListener("click", function () {
        var text = NEW_COMMENT.value.trim();
        if (!currentSlug) {
            return;
        }
        if (!text) {
            return toast("Write something before posting.");
        }

        var me = Profiles ? Profiles.get() : null;
        if (!me) {
            return toast("Choose a profile first.");
        }

        commentsFor(currentSlug).push({
            id: "c" + Date.now().toString(36),
            author: me.name,
            avatar: me.img,
            text: text,
            time: Date.now(),
            likedBy: {}
        });

        saveAll();
        NEW_COMMENT.value = "";
        renderComments();
        renderTitles();
        toast("Comment posted");
        NotifyComments(me.name);
    });

    NEW_COMMENT.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            POST_BTN.click();
        }
    });

    /* mint a real notification entry when the user posts a comment */
    function NotifyComments(author) {
        if (!window.Notifications) {
            return;
        }
        var list = window.Notifications.all();
        list.unshift({
            id: "c" + Date.now().toString(36) + "n",
            icon: "💬",
            title: "Comment posted",
            body: "Your comment on '" + (MOVIES[currentSlug] ? MOVIES[currentSlug].title : "") + "' is live.",
            time: Date.now(),
            read: false
        });
        try {
            localStorage.setItem("cinemoraNotifs", JSON.stringify(list));
        } catch (e) { /* ignore */ }
    }

    if (SEARCH) {
        SEARCH.addEventListener("input", function () {
            filter = SEARCH.value;
            renderTitles();
        });
    }

    function pickFromURL() {
        var match = /[?&]movie=([^&]+)/.exec(location.search);
        if (!match) {
            return;
        }
        var slug = decodeURIComponent(match[1]);
        if (MOVIES[slug]) {
            openThread(slug);
        }
    }

    function toast(message) {
        TOAST.textContent = message;
        TOAST.hidden = false;
        setTimeout(function () {
            TOAST.hidden = true;
        }, 2200);
    }

    load();
    renderTitles();
    pickFromURL();
})();