# DESIGN.md

Direction supplied by the owner (Lucas, @thelucas128). The agent transcribed it, it did not invent it.

## Identity

- Name: Lucas
- Handle: @thelucas128
- Bio, verbatim from GitHub: "Hi, I'm Lucas 🏳️‍⚧️ ~4 years backend Luau developer, specialized in OOP"
- Based in France. On GitHub since July 2022.
- Stack: Luau (language), Nodeal (framework).

## Personality

Engineering first. The work is modules, packages and systems, not campaigns. The site should read like a package index a developer keeps for himself: precise, numbered, terse, with the recordings as the only loud element.

## Palette

| Token | Value | Reason |
|---|---|---|
| ink | `#06080B` | Base. Near-black with a cold cast so the blue accent does not sit on neutral grey. |
| surface | `#0A0E14` | Panels and media frames. One step up from ink, enough to separate a panel without a shadow. |
| line | `#1A212C` | Hairlines. Structure comes from rules, not from cards floating on shadows. |
| text | `#E9EFF6` | Body copy. 17.3:1 on ink. |
| muted | `#97A5B6` | Secondary copy and metadata. 8.0:1 on ink, 7.7:1 on surface. |
| accent | `#7C97F5` | Links and focus. 7.3:1 on ink. |
| accent-fill | `#5071EA` | Fills and the section mark. Sampled from the Luau logo gradient. |

Two cores (ink, surface) plus neutrals plus one accent. The accent appears in three places only: links, the focus ring, and the section mark. It is never used as a background wash, never as a gradient, and there is no glow anywhere.

The supplied Nodeal icon keeps its purple-to-blue brand colors. That is the mark's identity, not a palette choice, and recolouring the logo is worse than letting its original hues in.

## Typography

- Display and body: **Archivo**. A tight, slightly industrial grotesque. Chosen because the content is engineering, and Archivo holds its shape at the very large sizes the name is set at, unlike the soft geometric defaults.
- Metadata, numbers, versions: **IBM Plex Mono**. Version strings, counts and package names are data. Plex Mono's slab terminals stay legible at 12px, and it is not the mono that ships with every generated page.
- The Nodeal icon is an image asset and does not add another typeface.

No uppercase labels with wide tracking. No monospace headings. Labels are lowercase mono, because they are data, not decoration.

## Identity motif

The Luau mark is a square rotated 15 degrees. That 15-degree square becomes the section marker, the favicon, and the bullet on every list. It is derived from the one asset the site is built around, so the motif belongs to this page rather than to a template.

Structure is carried by horizontal hairlines and mono numbers, like a package index. There is no background grid, no noise texture, no gradient mesh.

## Dials

- **ENERGY 3**: the name is set huge, the work is the loudest thing on the page, sections are separated by hard rules.
- **RHYTHM 3**: sections do not repeat a shape. The hero is a two-column split, the work entries alternate media-left, media-right, and full-width, and the repo entry has no media at all and carries a detection grid instead. The GitHub block is a profile panel beside a plain list.
- **MOTION 2**: a single scroll reveal and standard hover/focus transitions. No loops, no parallax, no auto-playing video, everything stops under `prefers-reduced-motion: reduce`.

## Owner-directed additions

- The reactive web background was requested after the first build. It is drawn on
  one fixed canvas in the accent colour at low alpha, it never sits above
  content, and it freezes to a single static frame under
  `prefers-reduced-motion: reduce`, so the motion dial still holds for anyone
  who asks for less motion.
- Entry 04 carries three captioned antiexploit recordings in a grid that spans the full entry width, mono
  captions like every other piece of data on the page.

## Content rules for this build

- Every number on the page is from the `nodeal-antiexploit` README or the GitHub API. Nothing is estimated.
- No testimonials, no client logos, no "trusted by", no pricing, no FAQ. None of it exists.
- The two Studio recordings are shown as recorded, with no performance claim attached, because no measurement was taken.
