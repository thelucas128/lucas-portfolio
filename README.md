# Portfolio

Static portfolio for Lucas (@thelucas128). No build step, no framework, no dependencies to install.

## Run it

Open `index.html` directly, or serve the folder:

```
npx serve .
```

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). The Studio recordings are stored in the repository root as `enhancedreplication.mp4` and `npc-system.mp4`. A GitHub Actions workflow is included to deploy the site to GitHub Pages automatically.

## Deploy on GitHub Pages

The page uses relative paths only, so it works from a subfolder such as `https://thelucas128.github.io/<repo>/` as well as from a user site.

1. Create the repository and push the folder contents to the branch root (`main`).
2. In repository Settings > Pages, set the build and deployment source to **GitHub Actions**.
3. Push to `main` (or manually run **Deploy static site to GitHub Pages** from the Actions tab). The workflow uploads the static site and publishes it; open the URL shown in the Pages settings when it completes.

`.nojekyll` is included so Pages serves the folder as-is instead of running Jekyll over it.

Keep the MP4s in the repository. GitHub accepts files up to 100 MB each and the whole folder is about 13 MB, so there is no need for Git LFS here. Pages is case-sensitive while Windows is not: all filenames are already lowercase, so keep them that way when adding files.

## Structure

```
index.html          the page
assets/styles.css   all styling
assets/app.js       scroll reveal, YouTube facade, GitHub API reads
assets/luau.svg     Luau mark, official
assets/nodeal.png   supplied Nodeal logo used across the site
assets/nodeal.svg   original Nodeal wordmark, retained
assets/mark.svg     favicon, the rotated square motif
enhancedreplication.mp4  Studio replication recording
npc-system.mp4           Studio NPC recording
DESIGN.md           the design direction and the reason for each choice
```

## Where the assets come from

- Luau mark: `luau-lang/site`, `src/assets/images/luau-logo.svg`, MIT.
- Nodeal icon: supplied by the site owner as `assets/nodeal.png`.
- Original Nodeal wordmark: `nodeal-framework/.github`, `assets/nodeal.svg` (retained but no longer used on the page).
- Profile data and repository list: the public GitHub API, read in the browser at page load. Nothing is hardcoded, so the section always shows the live state. If the API is rate limited or unreachable, the page says so and links to GitHub instead.

The YouTube thumbnail tries the high-resolution image first, then falls back to the standard thumbnail; if neither is available, a text fallback still lets visitors play the video. After playback starts, a direct YouTube link remains available if the embed cannot load.

## Editing content

Each project is an `<li class="entry">` in `index.html`. The four variants (`entry--media-left`, `entry--media-right`, `entry--full`, `entry--split`) are what give the page its rhythm, so keep them varied when adding entries.

Numbers and detection names on the anti-exploit entry come from that repository's README. If they change there, change them here, and do not add a detection or a number that the README does not state.
