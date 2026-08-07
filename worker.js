export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path.split("/").some((segment) => segment.startsWith("."))) {
      return new Response("Not found", { status: 404 });
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    const isHtml =
      contentType.includes("text/html") ||
      path === "/" ||
      path.endsWith(".html");

    if (!isHtml) {
      return response;
    }

    // HTML must revalidate so portfolio layout fixes show up after deploys.
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    headers.set("CDN-Cache-Control", "no-cache");
    headers.set("Cloudflare-CDN-Cache-Control", "no-cache");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
