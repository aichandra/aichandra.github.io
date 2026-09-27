# aichandra.github.io

Personal site, served by GitHub Pages at <https://aichandra.github.io/>.

Currently showing a holding page while the real site is built.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | The live page — self-contained, no dependencies |
| `.nojekyll` | Tells GitHub Pages to serve files as-is, skipping Jekyll |
| `_draft/` | Work in progress, git-ignored and deliberately unpublished |

## Running locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publishing

Any push to `main` redeploys the site, usually live within a minute.

```bash
git add -A
git commit -m "Update site"
git push
```
