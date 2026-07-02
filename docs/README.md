# Docs

## Public launch slides

**Present online:** https://poulsbopete.github.io/telco-demo/  
**Source:** [`public-launch-slides.md`](./public-launch-slides.md) (Marp markdown)

GitHub Pages serves the built deck from this folder (`docs/index.html`) on the `main` branch.

### Update slides

```bash
npm run build:slides    # regenerates docs/index.html
git add docs/index.html docs/public-launch-slides.md
git commit -m "Update launch slides"
git push
```

Pages redeploys automatically within ~1–2 minutes.

### Preview locally

```bash
npm run build:slides
open docs/index.html
```

**VS Code:** [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) for live preview while editing the markdown source.
