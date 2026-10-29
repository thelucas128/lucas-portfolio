/* Lucas (@thelucas128) portfolio.
   Three jobs: reveal on scroll, load the YouTube player on click,
   read the GitHub profile and repositories from the public API. */

(() => {
  'use strict';

  const USER = 'thelucas128';
  const API = 'https://api.github.com';

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

  /* ---------- scroll reveal ---------- */

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduced) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });

    reveals.forEach((el) => observer.observe(el));
  }

  /* ---------- YouTube facade ---------- */

  document.querySelectorAll('[data-video-thumbnail]').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallback) {
        image.closest('.facade').classList.add('facade--no-preview');
        image.remove();
        return;
      }
      image.dataset.fallback = 'true';
      image.src = image.src.replace('/maxresdefault.jpg', '/hqdefault.jpg');
    });
  });

  document.querySelectorAll('.facade').forEach((button) => {
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

  /* ---------- GitHub ---------- */

  const profileEl = document.getElementById('gh-profile');
  const reposEl = document.getElementById('gh-repos');
  const countEl = document.getElementById('gh-count');

  function profileLink(label) {
    return node('a', { href: 'https://github.com/' + USER }, label);
  }

  function renderProfile(data) {
    profileEl.removeAttribute('aria-busy');
    profileEl.textContent = '';

    const top = node('div', { class: 'profile-top' });
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
      (() => {
        const who = node('div');
        who.append(
          node('p', { class: 'profile-name' }, data.name || data.login),
          node('p', { class: 'profile-login' }, '@' + data.login)
        );
        return who;
      })()
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
    } catch (error) {
      const rateLimited = String(error.message).indexOf('403') !== -1;
      renderError(rateLimited ? 'rate limit reached, try again later' : 'offline or blocked');
    }
  }

  loadGithub();
})();