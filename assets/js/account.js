(function () {
    "use strict";

    var Profiles = window.Profiles;
    var SITE_NAME = window.SITE_NAME || "Reelora";
    var session = window.Auth ? window.Auth.session() : null;

    var PROFILE_LINE = document.getElementById("account-profile");
    var PLAN_BTN = document.getElementById("plan-btn");
    var PROFILE_BTN = document.getElementById("profile-btn");
    var NOTIF_BTN = document.getElementById("notif-btn");
    var SIGNOUT_BTN = document.getElementById("signout-btn");
    var TOAST = document.getElementById("toast");

    function toast(message) {
        TOAST.textContent = message;
        TOAST.hidden = false;
        setTimeout(function () {
            TOAST.hidden = true;
        }, 2200);
    }

    function render() {
        var me = Profiles ? Profiles.get() : null;
        var email = session && session.email ? session.email : "you@reelora.com";
        if (me && PROFILE_LINE) {
            PROFILE_LINE.textContent = "Active profile: " + me.name + " \u00B7 " + email;
        }
    }

    PLAN_BTN.addEventListener("click", function () {
        toast("This is a demo plan \u2014 " + SITE_NAME + " is a student project.");
    });

    PROFILE_BTN.addEventListener("click", function () {
        location.href = "profiles.html";
    });

    NOTIF_BTN.addEventListener("click", function () {
        location.href = "notifications.html";
    });

    SIGNOUT_BTN.addEventListener("click", function () {
        location.href = "profiles.html?signout=1";
    });

    render();
})();