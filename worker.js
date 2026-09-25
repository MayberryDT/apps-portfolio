export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Not found", { status: 404 });
    }
    if (path.split("/").some((segment) => segment.startsWith(".")) ||
        /\.(?:md|py|toml|jsonc)$/i.test(path) ||
        /^\/(?:docs|scripts|source|evidence)(?:\/|$)/.test(path) ||
        path === "/journal-prototype.html") {
      return new Response("Not found", { status: 404 });
    }

    const aliases = {
      "/index.html": "/",
      "/about": "/about.html", "/about/": "/about.html",
      "/press": "/press.html", "/press/": "/press.html",
      "/room": "/room.html", "/room/": "/room.html",
      "/googleb6430c0f57fbd860": "/googleb6430c0f57fbd860.html",
    };
    const isPublicAlias = ["www.tylermayberry.dev", "portfolio.animasai.co"].includes(url.hostname);
    const isProduction = url.hostname === "tylermayberry.dev" || isPublicAlias;
    if (Object.hasOwn(aliases, path) || isPublicAlias || (isProduction && url.protocol !== "https:")) {
      if (Object.hasOwn(aliases, path)) url.pathname = aliases[path];
      if (isProduction) { url.hostname = "tylermayberry.dev"; url.protocol = "https:"; url.port = ""; }
      return Response.redirect(url.href, 308);
    }

    // Exact filenames avoid Cloudflare's default .html -> extensionless redirect.
    // The root is an internal asset lookup, never a public redirect to index.html.
    const assetUrl = new URL(request.url);
    if (path === "/") assetUrl.pathname = "/index.html";
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));
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
