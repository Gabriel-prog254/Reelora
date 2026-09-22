/*
 * Authentication gate + session helper \u2014 loaded on every page.
 *
 * Guests are sent to the Sign In page before they can reach any app page.
 * The Sign In / Sign Up forms set the local session. Exposes: window.Auth
 */
(function () {
    "use strict";

    var KEY = "cinemoraSignedIn";
    var inPages = /\/pages\//.test(location.pathname);
    var base = inPages ? "../" : "";

    function isSignedIn() {
        try {
            return localStorage.getItem(KEY) === "1";
        } catch (e) {
            return false;
        }
    }

    function signIn() {
        try {
            localStorage.setItem(KEY, "1");
        } catch (e) { /* ignore */ }
    }

    function signOut() {
        try {
            localStorage.removeItem(KEY);
        } catch (e) { /* ignore */ }
    }

    window.Auth = {
        isSignedIn: isSignedIn,
        signIn: signIn,
        signOut: signOut
    };

    /* Auth pages opt out of the redirect guard via <body data-auth="guest">.
     * Scripts load at the end of <body>, so the element is always available. */
    var body = document.body;
    var guestPage = body && body.getAttribute("data-auth") === "guest";

    if (!guestPage && !isSignedIn()) {
        location.replace(base + "pages/Login.html");
        return;
    }

    var signinForm = document.querySelector("form[data-signin]");
    if (signinForm) {
        signinForm.addEventListener("submit", function (e) {
            e.preventDefault();
            signIn();
            location.href = base + "index.html";
        });
    }

    var signupForm = document.querySelector("form[data-signup]");
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            location.href = base + "pages/Login.html";
        });
    }
})();