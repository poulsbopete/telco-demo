# Elastic Observability for Telco — slides

**Live (Vercel):** https://telco-demo-sage.vercel.app/slides/  
**Presenter walk:** https://telco-demo-sage.vercel.app/presenter/view.html?doc=demo-walk  
**Landscape reference:** https://telco-demo-sage.vercel.app/presenter/view.html?doc=landscape  
**Source:** [DEMO-WALK.md](./DEMO-WALK.md) · [TELCO-LANDSCAPE-2026-REFERENCE.md](./TELCO-LANDSCAPE-2026-REFERENCE.md)

Edit `slides/public-launch-slides.md`, then:

```bash
npm run build:slides
git add docs/index.html public/slides/index.html slides/
git commit -m "Update telco slides"
git push
```

To refresh the `gh-pages` branch for GitHub Pages:

```bash
git checkout gh-pages
cp ../docs/index.html index.html   # from main after build
printf '\n' > .nojekyll
git add index.html .nojekyll && git commit -m "Update slides" && git push
git checkout main
```
