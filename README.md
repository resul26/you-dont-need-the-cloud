# You Don't Need The Cloud — interactive online book

A hand-built, interactive web edition of **["You Don't Need The Cloud"](https://resul26.github.io/you-dont-need-the-cloud/)** — a grumpy-person's guide to running serious AI on your own hardware. It's a retelling of Ahmad Osman's free **Local LLMs From Zero to Hero** article series (April–May 2026) — every table, every formula — plus **9 interactive widgets** you can touch.

**Live: https://resul26.github.io/you-dont-need-the-cloud/**

## What's inside

- 24 chapters + 3 appendices, each as its own page with prev/next navigation.
- Dark charcoal theme, Poppins, `#F05A28` accent.
- **Interactive widgets** (semantic SVG + vanilla JS + GSAP 3, no frameworks):
  - Fig 1 — The inference loop, choreographed five-act animation (Ch 1)
  - Token-stream generation demo (Ch 1)
  - KV cache simulator with live bars + verdict (Ch 3)
  - Prefill vs Decode race (Ch 4)
  - **VRAM calculator** — params × quant × context × GPU (Ch 6)
  - Fig 2 — Capacity vs bandwidth scatter, hoverable (Ch 8)
  - 2026 bandwidth ladder with filters (Ch 9)
  - Engine decision tree that picks itself (Ch 11)
  - Quantization trade-off bars (Ch 17)
  - Fig 3 — RAG pipeline, step-through 11 stages (Ch 19)

Diagrams follow the contract popularized by [`omkamal/animated-diagrams-skill`](https://github.com/omkamal/animated-diagrams-skill): semantic SVG ids, paused GSAP timelines, user controls (play/pause/replay/scrub), scroll-triggered autoplay, and — importantly — **full visibility without JS**, so the page is never gated on client execution.

## Build / publish

Static site — plain HTML/CSS/JS, no build step required. Hosted on GitHub Pages at the `/` of `main`:

```sh
git push   # pages builds & deploys in ~30-60s
```

To iterate on the source content or widgets and regenerate:

```sh
python3 build.py    # regenerates dist/ from chapters + widgets.py
python3 verify.py   # 27 structural checks on the built site
```

## Credits

- Source articles: Ahmad Osman ([@TheAhmadOsman](https://x.com/TheAhmadOsman)) — *LLMs 101*, *GPU Memory Math*, *Memory Bandwidth*, *Inference Engines* (2026 editions). Free and public. Go read the originals.
- Diagram/animation pattern: `omkamal/animated-diagrams-skill` (GSAP 3, semantic SVG, five-act choreography) — adapted here in hand-authored form; no rendered video assets used.
- Typeface: [Poppins](https://fonts.google.com/specimen/Poppins) (Google Fonts).
