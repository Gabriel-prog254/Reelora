(function () {
    "use strict";

    var Notifications = window.Notifications;
    var LIST = document.getElementById("notif-list");
    var EMPTY = document.getElementById("notif-empty");
    var MARK_ALL = document.getElementById("mark-all");
    var CLEAR_ALL = document.getElementById("clear-all");
    var TOAST = document.getElementById("toast");

    var SEEN = {}; /* keep the "just arrived" highlight until the user looks */

    function toast(message) {
        TOAST.textContent = message;
        TOAST.hidden = false;
        setTimeout(function () {
            TOAST.hidden = true;
        }, 2200);
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

    function render() {
        var list = Notifications.all();

        EMPTY.hidden = list.length > 0;
        LIST.hidden = list.length === 0;

        LIST.innerHTML = "";

        list.forEach(function (notif) {
            var item = document.createElement("button");
            item.type = "button";
            item.className = "notif-item" + (notif.read ? "" : " unread");

            var icon = document.createElement("span");
            icon.className = "notif-icon";
            icon.textContent = notif.icon;

            var body = document.createElement("div");
            body.className = "notif-body";
            body.innerHTML =
                "<h4>" + notif.title + "</h4>" +
                "<p>" + notif.body + "</p>" +
                '<div class="notif-time">' + timeAgo(notif.time) + "</div>";

            item.appendChild(icon);
            item.appendChild(body);

            if (!notif.read) {
                var dot = document.createElement("span");
                dot.className = "notif-dot-here";
                item.appendChild(dot);
            }

            item.addEventListener("click", function () {
                if (!notif.read) {
                    Notifications.markRead(notif.id);
                    render();
                    toast("Notification marked as read");
                }
            });

            LIST.appendChild(item);
        });
    }

    MARK_ALL.addEventListener("click", function () {
        Notifications.markAllRead();
        render();
        toast("All notifications marked as read");
    });

    CLEAR_ALL.addEventListener("click", function () {
        Notifications.clear();
        render();
        toast("Notifications cleared");
    });

    render();
})();