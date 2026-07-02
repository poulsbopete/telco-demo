# Elastic Observability for Telco — slides

**Live (Vercel):** https://telco-demo-sage.vercel.app/slides/  
**GitHub Pages:** https://poulsbopete.github.io/telco-demo/ *(repo Pages build currently failing — use Vercel link)*

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
