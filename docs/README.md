# Docs

## Public launch slides

**Present online:** https://poulsbopete.github.io/telco-demo/  
**Source:** [`public-launch-slides.md`](./public-launch-slides.md) (Marp markdown)

Slides rebuild automatically on push to `main` via [`.github/workflows/deploy-slides.yml`](../.github/workflows/deploy-slides.yml).

### Edit & preview locally

```bash
npx @marp-team/marp-cli docs/public-launch-slides.md -o /tmp/slides.html --html
open /tmp/slides.html
```

### Export PDF / PPTX (optional)

```bash
npx @marp-team/marp-cli docs/public-launch-slides.md -o docs/public-launch-slides.pdf
npx @marp-team/marp-cli docs/public-launch-slides.pptx
```

**VS Code:** [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) extension for live preview while editing.
