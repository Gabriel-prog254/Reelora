/*
 * TMDB configuration \u2014 this is the ONLY place your API key lives.
 * No other file in the project reads hardcoded keys; the data layer
 * (assets/js/api.js) reads everything from window.TMDB_CONFIG.
 *
 * SETUP (local development)
 * 1. Create a free TMDB account and get a v3 API key:
 *        https://www.themoviedb.org/settings/api
 * 2. Open assets/js/config.local.js and paste your key there. That file is
 *    loaded before this one on every page and is gitignored, so the key
 *    never gets committed to GitHub.
 *
 * SETUP (build step / env vars)
 * If you serve the site with a build step that injects env vars, you can
 * instead set the key before this file runs:
 *
 *     window.TMDB_API_KEY = "your_key_here";
 *
 * In that case the placeholder below is ignored.
 *
 * SECURITY NOTE
 * A key in a static site is visible in the browser \u2014 that is normal for
 * client-side apps like this student project. Keep it limited to the
 * TMDB developer / public plan, and keep the real key out of git by
 * using assets/js/config.local.js (already added to .gitignore).
 */
window.SITE_NAME = "Reelora";

window.TMDB_CONFIG = {
    apiKey: window.TMDB_API_KEY || window.TMDB_LOCAL_KEY || "REPLACE_WITH_YOUR_API_KEY",
    baseUrl: "https://api.themoviedb.org/3",
    imageBase: "https://image.tmdb.org/t/p/",
    language: "en-US"
};