# Milonga Las Tres Esquinas — landing page

Static landing page for the event **Milonga Las Tres Esquinas** (Friday 6
November 2026, Landgraaf, NL).

Plain HTML / CSS / JS — **no framework, no build step, no dependencies.**
Design system: [`../Wedding-dance/general-style.md`](../Wedding-dance/general-style.md).

## Structure

```
tresesquinas/
├── index.html        all sections + SEO + JSON-LD
├── css/styles.css    design tokens + components
├── js/main.js        nav, scroll-reveal, ticket privacy gate, sticky CTA
└── img/              photos (see notes below)
```

## Run locally

Any static server, e.g.:

```
npx serve tresesquinas        # or
python -m http.server 8000    # from inside tresesquinas/
```

Then open the site root. It also works opened directly as `index.html`,
except Google Fonts / external links need a connection.

## Things to fill in before publishing

1. **Image weight.** `profes.png` is a ~1.1 MB PNG (used in the Workshop
   section). Re-export as WebP/JPEG (~150–250 KB) at ~1000 px wide, same
   filename. Everything else is already light.
2. **Canonical / OG URL.** `index.html` assumes the page lives at
   `https://tangomj.nl/milonga-las-tres-esquinas/`. Adjust if the path differs.
3. **Parking photo** (`img/parking.webp`) is a Google Street View grab with the
   Maps UI still visible. Swap for a clean photo of the square if you have one.

## Ticket checkout

Early Bird (€20) → `https://buy.stripe.com/00wdR81S1f6e5rHczC4Rq0f`
Full Price Supporter (€28) → `https://buy.stripe.com/4gM7sKcwFbU2bQ56be4Rq0g`

Set on the `data-checkout-url` of each `[data-checkout]` button and in the
JSON-LD offers. The button stays disabled until the Privacy Policy checkbox is
ticked, then navigates to Stripe.

## Images in use

| File | Where |
|---|---|
| `organizadores.jpg` | hero background, Organizers section, OG image |
| `orquesta.jpg` | Live Music section |
| `profes.png` | Workshop section (Cinthya Tomino & Luciana Sacchetti) |
| `dj.jpg` | DJ section (Cinthya Tomino) |
| `video-bp.mp4` | Venue carousel (slide 1, native muted autoplay + loop) |
| `parking.webp` | Venue carousel (slide 2) |
| `logo_web.png` | header (Tango MJ mark) |
| `3-esq.webp` | footer (event wordmark) |
| `icon.png` | favicon / apple-touch-icon |

## Content decisions

- Event facts (date, schedule, teachers, DJ, orchestra, prices) come from the
  task brief, not from the current live page (which still shows an older event).
- Schedule: 19:30 workshop · 20:30 milonga · live music in two sets (21:15 and 22:45) · 01:00 end.
- A bar at the venue serves drinks all night (noted in the Venue section).
- WhatsApp contact for questions: +31 6 21710803 (`wa.me/31621710803`) — button in
  the Tickets section and a link in the footer.
- Google Maps link and free-parking note reused from the existing tangomj.nl page.
- No FAQ section, no individual musician names, no separate workshop/milonga
  checkout — per the brief.
