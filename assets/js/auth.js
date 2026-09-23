/*
 * Authentication gate + session helper \u2014 loaded on every page.
 *
 * Guests are sent to the Sign In page before they can reach any app page.
 * The Sign In / Sign Up forms set the local session. Exposes: window.Auth
 *
 * This is a demo: accounts live only in localStorage and nothing is ever
 * sent to a server. Sign In always succeeds \u2014 it reuses the name you
 * signed up with, or derives one from the email.
 */
(function () {
    "use strict";

    var KEY = "cinemoraSignedIn";
    var SESSION_KEY = "cinemoraSession";
    var ACCOUNTS_KEY = "cinemoraAccounts";
    var inPages = /\/pages\//.test(location.pathname);
    var base = inPages ? "../" : "";

    function isSignedIn() {
        try {
            return localStorage.getItem(KEY) === "1";
        } catch (e) {
            return false;
        }
    }

    function readAccounts() {
        try {
            var list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
            if (Array.isArray(list)) {
                return list;
            }
        } catch (e) { /* ignore */ }
        return [];
    }

    function writeAccounts(list) {
        try {
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
        } catch (e) { /* ignore */ }
    }

    function upsertAccount(account) {
        var list = readAccounts();
        var email = String(account.email || "").trim().toLowerCase();
        var found = false;
        for (var i = 0; i < list.length; i += 1) {
            if (String(list[i].email || "").trim().toLowerCase() === email) {
                list[i] = account;
                found = true;
                break;
            }
        }
        if (!found) {
            list.push(account);
        }
        writeAccounts(list);
    }

    function findAccount(email) {
        var needle = String(email || "").trim().toLowerCase();
        var list = readAccounts();
        for (var i = 0; i < list.length; i += 1) {
            if (String(list[i].email || "").trim().toLowerCase() === needle) {
                return list[i];
            }
        }
        return null;
    }

    /* "john.doe254@example.com" -> "John Doe254" */
    function nameFromEmail(email) {
        var local = String(email || "").split("@")[0];
        var words = local.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim().split(" ");
        var name = words.map(function (w) {
            return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
        }).join(" ");
        return (name || "Guest").slice(0, 20);
    }

    function startSession(name, email) {
        try {
            localStorage.setItem(KEY, "1");
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                name: String(name || "Guest").trim().slice(0, 40),
                email: String(email || "").trim()
            }));
        } catch (e) { /* ignore */ }
    }

    function session() {
        try {
            var raw = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (raw && typeof raw === "object") {
                return raw;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function signOut() {
        try {
            localStorage.removeItem(KEY);
            localStorage.removeItem(SESSION_KEY);
        } catch (e) { /* ignore */ }
    }

    /* Make sure a profile named after the current user exists and is active. */
    function ensureProfile(name) {
        if (!window.Profiles || typeof window.Profiles.ensure !== "function") {
            return;
        }
        window.Profiles.ensure(name);
    }

    window.Auth = {
        isSignedIn: isSignedIn,
        session: session,
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

            var email = signinForm.querySelector("#email").value.trim();
            var password = signinForm.querySelector("#password").value;

            var account = findAccount(email);
            var name = account && account.name
                ? account.name
                : nameFromEmail(email);

            if (!account) {
                upsertAccount({ name: name, email: email, password: password });
            }

            startSession(name, email);
            ensureProfile(name);
            location.href = base + "pages/profiles.html";
        });
    }

    var signupForm = document.querySelector("form[data-signup]");
    if (signupForm) {
        var errorBox = signupForm.querySelector("[data-form-error]");
        var fullname = signupForm.querySelector("#fullname");
        var email = signupForm.querySelector("#email");
        var password = signupForm.querySelector("#password");
        var confirm = signupForm.querySelector("#confirm");

        function setError(message) {
            if (!errorBox) {
                return;
            }
            errorBox.textContent = message;
            errorBox.hidden = !message;
        }

        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            setError("");

            var name = fullname.value.trim();
            if (!name) {
                setError("Please enter your name.");
                return;
            }
            if (password.value.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
            }
            if (password.value !== confirm.value) {
                setError("Passwords do not match.");
                return;
            }

            upsertAccount({
                name: name,
                email: email.value.trim(),
                password: password.value
            });

            startSession(name, email.value);
            ensureProfile(name);
            location.href = base + "pages/profiles.html";
        });

        password.addEventListener("input", setError.bind(null, ""));
        confirm.addEventListener("input", setError.bind(null, ""));
        fullname.addEventListener("input", setError.bind(null, ""));
        email.addEventListener("input", setError.bind(null, ""));
    }
})();