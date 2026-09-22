/*
 * Branding \u2014 renders the site name everywhere from the single
 * SITE_NAME constant (assets/js/config.js). No hardcoded brand text.
 *
 * Load after config.js on every page.
 */

(function () {
    "use strict";

    var SITE_NAME = window.SITE_NAME || "CINEMORA";

    /* "N - Watch TV Shows Online" -> "CINEMORA - Watch TV Shows Online" */
    document.title = document.title.replace(/^N(\s*-)?\s*/, SITE_NAME + " - ");

    document.querySelectorAll("[data-brand]").forEach(function (el) {
        var type = el.getAttribute("data-brand");
        if (type === "name") {
            el.textContent = SITE_NAME;
        } else if (type === "originals") {
            el.textContent = SITE_NAME + " Originals";
        } else if (type === "copyright") {
            el.textContent = "\u00A9 2026 " + SITE_NAME + ". This is a student practice project.";
        }
    });
})();