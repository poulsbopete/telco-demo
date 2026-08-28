# Elastic Observability for Telco — slides

**Live (Vercel):** https://telco-demo-sage.vercel.app/slides/  
**T-Mobile Site DR (business value, 4 slides):** https://telco-demo-sage.vercel.app/slides/tmobile-site-dr/  
**Presenter walk:** https://telco-demo-sage.vercel.app/presenter/view.html?doc=demo-walk  
**Landscape reference:** https://telco-demo-sage.vercel.app/presenter/view.html?doc=landscape  
**Source:** [DEMO-WALK.md](./DEMO-WALK.md) · [TELCO-LANDSCAPE-2026-REFERENCE.md](./TELCO-LANDSCAPE-2026-REFERENCE.md) · [tmobile-site-dr.md](./tmobile-site-dr.md)

Edit `slides/public-launch-slides.md` (general) or `slides/tmobile-site-dr.md` (T-Mobile Site DR), then:

```bash
npm run build:slides
git add docs/index.html public/slides/ slides/
git commit -m "Update telco slides"
git push
```

The T-Mobile Site DR deck is **URL-only** — it is not linked from the app top nav.

To refresh the `gh-pages` branch for GitHub Pages:

```bash
git checkout gh-pages
cp ../docs/index.html index.html   # from main after build
printf '\n' > .nojekyll
git add index.html .nojekyll && git commit -m "Update slides" && git push
git checkout main
```
