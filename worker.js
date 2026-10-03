// Sent with every page and asset. HSTS covers this host only: the project
// subdomains are separate Workers.
const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Content-Security-Policy": "frame-ancestors 'self'",
};

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
        (/\.(?:md|py|toml|jsonc)$/i.test(path) && path !== "/ai-instructions.md") ||
        /^\/(?:docs|scripts|source|evidence)(?:\/|$)/.test(path) ||
        path === "/journal-prototype.html") {
      return new Response("Not found", { status: 404 });
    }

    const aliases = {
      "/index.html": "/",
      "/about": "/about.html", "/about/": "/about.html",
      "/press": "/press.html", "/press/": "/press.html",
      "/room": "/room.html", "/room/": "/room.html",
      "/notes/": "/notes", "/notes/index.html": "/notes",
      "/ai-instructions/": "/ai-instructions", "/ai-instructions.html": "/ai-instructions",
      "/googleb6430c0f57fbd860": "/googleb6430c0f57fbd860.html",
    };
    const isPublicAlias = ["www.tylermayberry.dev", "portfolio.animasai.co"].includes(url.hostname);
    const isProduction = url.hostname === "tylermayberry.dev" || isPublicAlias;
    // Notes live at extensionless URLs; their .html filenames redirect there.
    const redirectTo = Object.hasOwn(aliases, path) ? aliases[path]
      : /^\/notes\/[a-z0-9-]+\.html$/.test(path) ? path.slice(0, -5) : null;
    if (redirectTo || isPublicAlias || (isProduction && url.protocol !== "https:")) {
      if (redirectTo) url.pathname = redirectTo;
      if (isProduction) { url.hostname = "tylermayberry.dev"; url.protocol = "https:"; url.port = ""; }
      return Response.redirect(url.href, 308);
    }

    // Exact filenames avoid Cloudflare's default .html -> extensionless redirect.
    // The root is an internal asset lookup, never a public redirect to index.html.
    const assetUrl = new URL(request.url);
    if (path === "/") assetUrl.pathname = "/index.html";
    else if (path === "/notes") assetUrl.pathname = "/notes/index.html";
    else if (/^\/notes\/[a-z0-9-]+$/.test(path)) assetUrl.pathname = path + ".html";
    else if (path === "/ai-instructions") assetUrl.pathname = "/ai-instructions.html";
    // The Markdown copy is stored as .txt because .assetsignore drops every .md file.
    else if (path === "/ai-instructions.md") assetUrl.pathname = "/ai-instructions.txt";
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));
    const contentType = response.headers.get("content-type") || "";
    const isHtml =
      contentType.includes("text/html") ||
      path === "/" ||
      path.endsWith(".html");

    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
    if (path === "/ai-instructions.md" && response.ok) headers.set("Content-Type", "text/markdown; charset=utf-8");
    if (!isHtml) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // HTML must revalidate so portfolio layout fixes show up after deploys.
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
