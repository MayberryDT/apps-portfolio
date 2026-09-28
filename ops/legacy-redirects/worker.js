// Permanent redirects for Tyler's projects that moved off animasai.co.
// Moved projects keep their path and query; retired pages go to their real home.
const MOVED = {
  'milk.animasai.co': 'https://milk.tylermayberry.dev',
  'dow.animasai.co': 'https://dow.tylermayberry.dev',
  'paycheck.animasai.co': 'https://paycheck.tylermayberry.dev',
  'stayconnect.animasai.co': 'https://stayconnect.tylermayberry.dev',
  'jobapps.animasai.co': 'https://jobapps.tylermayberry.dev',
  'rat-detective.animasai.co': 'https://ratdetective.online',
};

const HOME = {
  'wargus.animasai.co': 'https://dow.tylermayberry.dev/',
  'admirable-pony.animasai.co': 'https://ratdetective.online/',
  'executioner.animasai.co': 'https://executionr.com/',
  'executionr.animasai.co': 'https://executionr.com/',
  'masthead.animasai.co': 'https://usemasthead.com/',
  'hub.animasai.co': 'https://tylermayberry.dev/',
  'resume.animasai.co': 'https://tylermayberry.dev/',
};

export default {
  fetch(request) {
    const url = new URL(request.url);
    const moved = MOVED[url.hostname];
    const target = moved ? moved + url.pathname + url.search : HOME[url.hostname];
    if (!target) return new Response('Not found', { status: 404 });
    const status = request.method === 'GET' || request.method === 'HEAD' ? 301 : 308;
    return new Response(null, { status, headers: { Location: target } });
  },
};
