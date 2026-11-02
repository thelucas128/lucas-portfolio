/* Lucas (@thelucas128) portfolio.
   Four jobs: render the work list from assets/work.json, reveal on scroll,
   load the YouTube player on click, read the GitHub profile and repositories
   from the public API with a local cache so a rate limit does not blank the page. */

(() => {
  'use strict';

  const USER = 'thelucas128';
  const API = 'https://api.github.com';
  const CACHE_KEY = 'portfolio:github:v1';
  const CACHE_TTL = 10 * 60 * 1000;

  const TECH = {
    luau: { src: 'assets/luau.svg', label: 'Luau', width: 52, height: 52 },
    nodeal: { src: 'assets/nodeal.svg', label: 'Nodeal', width: 40, height: 40, cls: 'nodeal-mark' }
  };

  function node(tag, attrs, text) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const key of Object.keys(attrs)) {
        const value = attrs[key];
        if (value === null || value === undefined) continue;
        if (key === 'class') n.className = value;
        else n.setAttribute(key, value);
      }
    }
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function monthYear(iso) {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
  }

  function githubIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute(
      'd',
      'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.16 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z'
    );
    svg.append(path);
    return svg;
  }

  /* ---------- scroll reveal ---------- */

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window && !reducedMotion;

  let revealObserver = null;

  function observeReveals(root) {
    const targets = Array.from((root || document).querySelectorAll('.reveal:not(.is-in)'));
    if (!canObserve) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });
    }
    targets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- YouTube facade ---------- */

  function bindFacades(root) {
    (root || document).querySelectorAll('[data-video-thumbnail]:not([data-bound])').forEach((image) => {
      image.dataset.bound = 'true';
      image.addEventListener('error', () => {
        if (image.dataset.fallback) {
          const facade = image.closest('.facade');
          if (facade) facade.classList.add('facade--no-preview');
          image.remove();
          return;
        }
        image.dataset.fallback = 'true';
        image.src = image.src.replace('/maxresdefault.jpg', '/hqdefault.jpg');
      });
    });

    (root || document).querySelectorAll('.facade:not([data-bound])').forEach((button) => {
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const id = button.dataset.video;
        if (!id) return;

        const frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
        frame.title = button.dataset.title || 'YouTube video';
        frame.width = '1280';
        frame.height = '720';
        frame.loading = 'lazy';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        frame.allowFullscreen = true;

        const container = button.parentNode;
        container.replaceChild(frame, button);
        container.append(node('a', {
          class: 'embed-fallback',
          href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(id),
          target: '_blank',
          rel: 'noopener noreferrer'
        }, 'Having trouble with the embed? Watch on YouTube'));
        frame.focus();
      });
    });
  }

  /* ---------- work list, rendered from assets/work.json ---------- */

  const workList = document.getElementById('work-list');
  const workCount = document.getElementById('work-count');
  const workNote = document.getElementById('work-note');

  function renderTech(keys) {
    const wrap = node('span', { class: 'stack' });
    (keys || []).forEach((key) => {
      const tech = TECH[key];
      if (!tech) return;
      const item = node('span', { class: 'tech' });
      item.append(
        node('img', {
          class: tech.cls || null,
          src: tech.src,
          alt: '',
          'aria-hidden': 'true',
          width: String(tech.width),
          height: String(tech.height)
        }),
        node('span', null, tech.label)
      );
      wrap.append(item);
    });
    return wrap;
  }

  function renderMedia(media) {
    const wrap = node('div', { class: 'entry-media' });
    if (!media) return wrap;

    if (media.type === 'youtube' && media.id) {
      const button = node('button', {
        class: 'facade',
        type: 'button',
        'data-video': media.id,
        'data-title': media.title || 'YouTube video',
        'aria-label': media.label || 'Play video on YouTube'
      });
      button.append(
        node('img', {
          src: 'https://i.ytimg.com/vi/' + encodeURIComponent(media.id) + '/maxresdefault.jpg',
          alt: '',
          width: '1280',
          height: '720',
          loading: 'lazy',
          decoding: 'async',
          'data-video-thumbnail': ''
        })
      );
      const play = node('span', { class: 'facade-play', 'aria-hidden': 'true' });
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '22');
      svg.setAttribute('height', '22');
      svg.setAttribute('focusable', 'false');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('fill', 'currentColor');
      path.setAttribute('d', 'M9 6.5v11l9-5.5z');
      svg.append(path);
      play.append(svg);
      button.append(play);
      wrap.append(button);
      return wrap;
    }

    if (media.type === 'video' && media.src) {
      const video = node('video', {
        controls: '',
        preload: 'metadata',
        playsinline: '',
        width: String(media.width || 1920),
        height: String(media.height || 1080)
      });
      const source = node('source', { src: media.src, type: 'video/mp4' });
      video.append(source);
      const fallback = node('a', { href: media.src }, 'Download the recording');
      video.append(document.createTextNode('Your browser cannot play this MP4. '), fallback, document.createTextNode('.'));
      wrap.append(video);
      return wrap;
    }

    return wrap;
  }

  function renderText(entry) {
    const wrap = node('div', { class: 'entry-text' });
    (entry.text || []).forEach((paragraph) => wrap.append(node('p', { class: 'entry-desc' }, paragraph)));
    if (entry.note) wrap.append(node('p', { class: 'entry-desc entry-desc--note' }, entry.note));

    if (entry.links && entry.links.length) {
      const links = node('p', { class: 'entry-links' });
      entry.links.forEach((link) => {
        const a = node('a', { href: link.href }, null);
        if (link.icon === 'github') a.append(githubIcon(), document.createTextNode(' ' + link.label));
        else a.textContent = link.label;
        links.append(a);
      });
      wrap.append(links);
    }
    return wrap;
  }

  function renderDetections(detections) {
    const wrap = node('div', { class: 'detections' });
    const title = node('p', { class: 'detect-title' });
    title.append(
      node('span', null, detections.title || 'Detections'),
      node('span', { class: 'detect-ver' }, detections.version || '')
    );
    wrap.append(title);

    const list = node('dl', { class: 'detect-list' });
    (detections.items || []).forEach((item) => {
      const row = node('div', { class: 'detect' });
      row.append(node('dt', null, item.term), node('dd', null, item.detail));
      list.append(row);
    });
    wrap.append(list);

    if (detections.note) wrap.append(node('p', { class: 'detect-note' }, detections.note));
    return wrap;
  }

  function renderEntry(entry, index) {
    const layout = entry.layout ? ' ' + entry.layout : '';
    const item = node('li', { class: 'entry entry--' + (layout.trim() || 'full') + ' reveal' });
    item.style.setProperty('--entry-index', String(index));

    const head = node('div', { class: 'entry-head' });
    head.append(
      node('span', { class: 'entry-num' }, entry.num || String(index + 1).padStart(2, '0')),
      node('h3', null, entry.title),
      renderTech(entry.tech)
    );
    item.append(head);

    const blocks = [];
    if (entry.text || entry.note || entry.links) blocks.push({ kind: 'text', el: renderText(entry) });
    if (entry.media) blocks.push({ kind: 'media', el: renderMedia(entry.media) });
    if (entry.detections) blocks.push({ kind: 'detections', el: renderDetections(entry.detections) });

    if (entry.mediaFirst) blocks.sort((a, b) => (a.kind === 'media' ? -1 : b.kind === 'media' ? 1 : 0));
    blocks.forEach((block) => item.append(block.el));

    return item;
  }

  function renderWork(data) {
    if (!workList) return;
    workList.removeAttribute('aria-busy');
    workList.textContent = '';

    const entries = (data && data.entries) || [];
    if (!entries.length) {
      workList.append(node('li', { class: 'state' }, 'No entries in assets/work.json.'));
      if (workCount) workCount.textContent = '';
      return;
    }

    entries.forEach((entry, index) => workList.append(renderEntry(entry, index)));

    if (workCount) workCount.textContent = entries.length + (entries.length === 1 ? ' entry' : ' entries');
    if (workNote && data.note) workNote.textContent = data.note;

    observeReveals(workList);
    bindFacades(workList);
  }

  function renderWorkError(detail) {
    if (!workList) return;
    workList.removeAttribute('aria-busy');
    workList.textContent = '';
    const message = node('li', { class: 'state state--error' }, 'The work list could not be read: ' + detail + '. ');
    message.append(node('a', { href: 'https://github.com/' + USER + '?tab=repositories' }, 'See the repositories on GitHub'));
    workList.append(message);
    if (workCount) workCount.textContent = '';
  }

  async function loadWork() {
    if (!workList) return;
    try {
      const res = await fetch('assets/work.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      renderWork(await res.json());
    } catch (error) {
      renderWorkError(String(error.message || 'unavailable'));
    }
  }

  /* ---------- GitHub, read live with a local cache ---------- */

  const profileEl = document.getElementById('gh-profile');
  const reposEl = document.getElementById('gh-repos');
  const countEl = document.getElementById('gh-count');
  const sinceEl = document.getElementById('fact-since');

  function profileLink(label) {
    return node('a', { href: 'https://github.com/' + USER }, label);
  }

  function readCache() {
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.savedAt) return null;
      if (Date.now() - parsed.savedAt > CACHE_TTL) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function writeCache(payload) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({
        savedAt: Date.now(),
        profile: payload.profile,
        repos: payload.repos
      }));
    } catch (error) {
      /* private mode or quota: caching is optional */
    }
  }

  function renderProfile(data) {
    profileEl.removeAttribute('aria-busy');
    profileEl.textContent = '';

    const top = node('div', { class: 'profile-top' });
    const who = node('div');
    who.append(
      node('p', { class: 'profile-name' }, data.name || data.login),
      node('p', { class: 'profile-login' }, '@' + data.login)
    );
    top.append(
      node('img', {
        class: 'avatar',
        src: data.avatar_url,
        alt: 'Lucas on GitHub',
        width: '54',
        height: '54',
        loading: 'lazy',
        decoding: 'async'
      }),
      who
    );
    profileEl.append(top);

    if (data.bio) profileEl.append(node('p', { class: 'profile-bio' }, data.bio));

    const facts = node('dl', { class: 'profile-facts' });
    const addFact = (label, value) => {
      if (!value) return;
      const row = node('div', { class: 'fact' });
      row.append(node('dt', null, label), node('dd', null, String(value)));
      facts.append(row);
    };

    addFact('location', data.location);
    addFact('public repos', data.public_repos);
    addFact('followers', data.followers);
    addFact('joined', monthYear(data.created_at));
    if (facts.children.length) profileEl.append(facts);

    const links = node('p', { class: 'entry-links' });
    links.append(profileLink('Open profile on GitHub'));
    profileEl.append(links);

    if (sinceEl && data.created_at) {
      const year = new Date(data.created_at).getFullYear();
      if (!Number.isNaN(year)) sinceEl.textContent = String(year);
    }
  }

  function renderRepos(list) {
    reposEl.removeAttribute('aria-busy');
    reposEl.textContent = '';

    if (!Array.isArray(list) || list.length === 0) {
      reposEl.append(node('li', { class: 'state' }, 'No public repositories were returned.'));
      if (countEl) countEl.textContent = '';
      return;
    }

    const repos = list.slice().sort((a, b) => {
      return new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at);
    });

    if (countEl) countEl.textContent = '(' + repos.length + ')';

    repos.forEach((repo) => {
      const item = node('li', { class: 'repo' });
      const name = node('a', { class: 'repo-name', href: repo.html_url }, repo.name);
      if (repo.fork) name.append(node('span', { class: 'repo-fork' }, 'fork'));

      item.append(
        name,
        node('span', { class: 'repo-updated' }, monthYear(repo.pushed_at || repo.updated_at))
      );

      const meta = node('div', { class: 'repo-meta' });
      if (repo.language) meta.append(node('span', { class: 'repo-lang' }, repo.language));
      if (repo.license && repo.license.spdx_id && repo.license.spdx_id !== 'NOASSERTION') {
        meta.append(node('span', null, repo.license.spdx_id));
      }
      if (repo.description) meta.append(node('span', { class: 'repo-desc' }, repo.description));
      if (meta.children.length) item.append(meta);

      reposEl.append(item);
    });
  }

  function renderError(detail) {
    profileEl.removeAttribute('aria-busy');
    profileEl.textContent = '';
    const message = node('p', { class: 'state state--error' }, 'GitHub did not answer: ' + detail + '. ');
    message.append(profileLink('Open the profile directly'));
    profileEl.append(message);

    reposEl.removeAttribute('aria-busy');
    reposEl.textContent = '';
    reposEl.append(node('li', { class: 'state state--error' }, 'The repository list is unavailable right now.'));
    if (countEl) countEl.textContent = '';
  }

  async function loadGithub() {
    if (!profileEl || !reposEl) return;

    const cached = readCache();
    if (cached && cached.profile && cached.repos) {
      renderProfile(cached.profile);
      renderRepos(cached.repos);
      return;
    }

    const headers = { Accept: 'application/vnd.github+json' };

    try {
      const [profileRes, reposRes] = await Promise.all([
        fetch(API + '/users/' + USER, { headers }),
        fetch(API + '/users/' + USER + '/repos?per_page=100&sort=pushed', { headers })
      ]);

      if (!profileRes.ok) throw new Error('HTTP ' + profileRes.status);
      if (!reposRes.ok) throw new Error('HTTP ' + reposRes.status);

      const profile = await profileRes.json();
      const repos = await reposRes.json();

      renderProfile(profile);
      renderRepos(repos);
      writeCache({ profile, repos });
    } catch (error) {
      const message = String(error.message);
      const rateLimited = message.indexOf('403') !== -1 || message.indexOf('429') !== -1;
      renderError(rateLimited ? 'rate limit reached, try again later' : 'offline or blocked');
    }
  }

  /* ---------- boot ---------- */

  observeReveals(document);
  bindFacades(document);
  loadWork();
  loadGithub();
})();
