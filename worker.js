export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path.split("/").some((segment) => segment.startsWith("."))) {
      return new Response("Not found", { status: 404 });
    }

    return env.ASSETS.fetch(request);
  }
};
