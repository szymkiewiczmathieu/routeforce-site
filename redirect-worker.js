/**
 * Redirect all traffic from routeforce.app to gettourvia.com.
 * Preserves path, query string, and fragment.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search + url.hash, "https://gettourvia.com");

    return new Response(null, {
      status: 301,
      statusText: "Moved Permanently",
      headers: {
        Location: target.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  },
};
