# aichandra.github.io

Personal academic site of Abhishek Chandra, served by GitHub Pages at
<https://aichandra.github.io/>.

Static HTML, CSS and JavaScript. No build step, no dependencies.

## Structure

```
index.html          Home: profile, biography, news
research.html       Journal, conference and workshop papers, preprints
teaching.html       Courses and student supervision
roles.html          Organization, service and peer review
assets/
  css/styles.css    Design tokens, layout, components, responsive rules
  js/site.js        Typed intro, scroll reveal, small enhancements
  img/              Portraits
  favicon.svg
.nojekyll           Serve files as-is, skipping Jekyll
```

## Running locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Publishing

Pushing to `main` redeploys the site, usually live within a minute.

```bash
git add -A
git commit -m "Update site"
git push
```

## Notes

- The page renders fully without JavaScript. `site.js` only adds the typed
  introduction and the scroll reveal; both are skipped when the visitor has
  `prefers-reduced-motion` set.
- The typed introduction runs once per browser session, tracked in
  `sessionStorage`.
- Reveal states are toggled with `.is-in`. The rules that reveal an element
  repeat the full hiding selector, because a bare `.is-in` would lose on
  specificity to selectors such as `.js .section > h2`.
- Colours are CSS custom properties at the top of `styles.css`. Changing
  `--link` reskins the site.
