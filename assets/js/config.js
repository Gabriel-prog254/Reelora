/*
 * TMDB configuration — this is the ONLY place your API key lives.
 * No other file in the project reads hardcoded keys; the data layer
 * (assets/js/api.js) reads everything from window.TMDB_CONFIG.
 *
 * SETUP
 * 1. Create a free TMDB account and get a v3 API key:
 *        https://www.themoviedb.org/settings/api
 * 2. Replace "REPLACE_WITH_YOUR_API_KEY" below with your key.
 *
 * ENVIRONMENT VARIABLE OPTION
 * If you serve the site with a build step that injects env vars, you can
 * instead set the key before this file runs:
 *
 *     window.TMDB_API_KEY = "your_key_here";
 *
 * In that case the placeholder below is ignored.
 *
 * SECURITY NOTE
 * A key in a static site is visible in the browser — that is normal for
 * client-side apps like this student project. Keep it limited to the
 * TMDB developer / public plan, and if you use git, exclude this file
 * (add "assets/js/config.js" to .gitignore) so the key isn't committed.
 */
window.SITE_NAME = "CINEMORA";

window.TMDB_CONFIG = {
    apiKey: window.TMDB_API_KEY || "REPLACE_WITH_YOUR_API_KEY",
    baseUrl: "https://api.themoviedb.org/3",
    imageBase: "https://image.tmdb.org/t/p/",
    language: "en-US"
};