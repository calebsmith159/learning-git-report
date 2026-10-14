# Learning Git: Website Report

## Overview
"Learning Git" is a single-page, static website that works as a visual Git cheat sheet. It was built for a design system course.

## Content
It covers eleven Git and GitHub concepts: repository, clone, branch, commit, push/pull, diff, merge, rebase, merge conflict, pull request and issue.

Each concept section includes:
- a short explanation and example commands
- a list of considerations (things to watch out for)
- an animated SVG diagram with a replay button
- links to further resources (Pro Git, GitHub Docs)

## Structure
| File | Lines | Purpose |
|------|------:|---------|
| `index.html` | 933 | Page markup, table of contents, concept sections, inline SVG diagrams |
| `styles.css` | 704 | Styling and layout |
| `script.js` | 396 | Animation playback and interactivity |

## Notes
- No build step or dependencies; open `index.html` in a browser.
- Fonts (JetBrains Mono, Montserrat, Oswald) load from Google Fonts.
- Navigation: a table of contents in the header plus a chip bar linking to each concept.
