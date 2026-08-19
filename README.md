# Back Four ⚽

A daily football grouping puzzle in the spirit of NYT Connections. Every tile
fits the day's **theme**; your job is to find the four groups of four hiding
inside it. No build step, no dependencies — four files and a puzzle bank.

```
index.html        markup
styles.css        theme + layout
js/puzzles.js     the 25-puzzle bank
js/app.js         game logic
js/motion.js      ambient parallax + tile tilt (progressive enhancement)
tools/solve.py    validator + uniqueness solver (dev only)
```

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173

## Look & motion

Editorial / muted direction inspired by the Dropbox brand site: a warm light
canvas, oversized Archivo Expanded display type, and desaturated competition
colours (sage / terracotta / mauve / slate) rather than bold primaries. Ambient
football motifs (SVG, in `index.html`) float behind the board and drift with the
cursor; tiles tilt in 3D toward the pointer. All motion is in `js/motion.js`,
respects `prefers-reduced-motion`, and never touches game logic.

## The tiers

Difficulty is a ladder mapped to competitions. A group's colour is revealed
when you solve it; the trickiest group is almost always Champions League.

| Tier | Competition | Colour | Role |
|---|---|---|---|
| 0 | League Cup | green | the gimme |
| 1 | FA Cup | red | steady |
| 2 | Premier League | purple | tricky |
| 3 | Champions League | blue | the killer / the trap |

## Where the difficulty comes from

Every puzzle is built around **overlap traps**: mainstream tiles that could
plausibly be argued into two groups, where only one full 4×4 assignment
actually works. San Siro, for example — Pirlo and Seedorf look like Milan's
2007 Champions League side, but that group is already full of players who never
wore Inter blue, forcing the pair into "played for both Milan clubs."

The theme is shown up front on purpose: it lets the categories overlap harder
while keeping the puzzle fair.

## Verifying puzzles

`js/puzzles.js` records each tile's extra truthful memberships as `traps`.
`tools/solve.py` checks structure (4 groups × 4 unique tiles, tiers 0–3) and,
crucially, proves each puzzle has **exactly one** valid solution given its
traps. Run it after any edit:

```bash
python3 tools/solve.py
```

A puzzle that reports `2+ valid solutions` is genuinely ambiguous and must be
rewritten (break the symmetry — swap out a tile that fits two groups equally).

## How the daily puzzle works

`todayIndex()` maps the local calendar date to a puzzle: days since 2024-01-01,
modulo the number of puzzles. Everyone on the same date gets the same grid, and
it rolls over at local midnight. With 25 puzzles the bank repeats every 25 days
— add more to stretch that out.

Direct link to any puzzle (for testing or sharing): `/?p=7` (matches the `id`).

## Adding puzzles

Append to `PUZZLES` in `js/puzzles.js`:

```js
{
  id: 26,
  name: "Short display name",
  theme: "The visible theme",
  groups: [
    { tier: 0, name: "Easiest connection",   items: ["A","B","C","D"] },
    { tier: 1, name: "…",                      items: [...] },
    { tier: 2, name: "…",                      items: [...] },
    { tier: 3, name: "Trickiest connection",   items: [...] }
  ],
  // extra truthful memberships beyond a tile's own group, as [tile, tierIndex]
  traps: [["TILE_TEXT", 1]]
}
```

Rules that keep puzzles fair and fun:

- Exactly 4 groups, 4 items each, `tier` 0–3 used once each, no repeated tile.
- Build in 1–3 **overlap traps** — tiles a knowledgeable fan would see fitting a
  second group — then annotate them and let `solve.py` confirm uniqueness.
- List every real overlap you can think of in `traps`; if the solver still says
  "unique", the design is sound. If it says "2+", you have a genuine ambiguity.
- Keep tiles short — under ~13 characters reads best on phones (they auto-shrink).

Bump the `?v=` query on the script/style tags in `index.html` when you deploy
changes, so browsers don't serve stale files.

## Deploy

It's a static site — any host works. Point the host at this folder; no build
command, no output directory. Netlify Drop / Vercel / Cloudflare Pages / GitHub
Pages all work in a couple of minutes.

## What's stored

Everything is `localStorage` on the player's device: per-puzzle progress
(`b4:v1:progress:<id>`) and daily stats (`b4:v1:stats`). No accounts, no server,
no tracking. Archive puzzles don't count toward the streak.
