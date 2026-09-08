# Paige Southwick Events, Claude implementation

The Claude version of the PS Events website. Independent of `codex-site/`, built from the
same shared source material in `../assets/`.

## Stack

Pure HTML, CSS, and JavaScript. No framework, no bundler, no build step, no dependencies.
Open `index.html` in a browser and it runs. Deploy by copying this folder to any static host.

## Structure

```
claude-site/
  index.html          Home
  services.html       Packages, comparison table, FAQ
  gallery.html        Twelve photographs with a lightbox
  about.html          Meet Paige, mission statement, process
  contact.html        Inquiry composer
  404.html            Not found
  css/styles.css      Single stylesheet, custom properties at the top
  js/main.js          Navigation, scroll reveal, lightbox, inquiry composer
  assets/brand/       Vector logo, favicons, social image
  assets/img/         Responsive photo derivatives, WebP and JPG at 640, 1000, 1600
  site.webmanifest    Installable metadata
  robots.txt          Crawl policy
  sitemap.xml         Page index
```

## Brand

Sampled from `../assets/PS Events Branding.png`:

| Token | Value | Use |
| --- | --- | --- |
| `--blush` | `#E3B7C0` | decorative fields and ornaments |
| `--sand` | `#E0BAA1` | hairlines and dividers |
| `--cream` | `#F0E6DB` | alternating section background |
| `--ivory` | `#FFF6EE` | page background |
| `--blush-deep` | `#93505F` | small blush text, meets 4.5:1 |
| `--sand-deep` | `#8C5C36` | small sand text, meets 4.5:1 |
| `--ink` | `#221C1A` | body copy and footer |

Typography follows the branding sheet: Libre Baskerville for headings at 0.114em letter
spacing, Arima uppercase for subtitles and lowercase for body copy. Both load from Google
Fonts. The site falls back to Georgia and a system sans if that request fails.

The blush and sand at full strength are decorative only. Every piece of small text uses the
derived deep tones so it clears WCAG AA on both the ivory and cream backgrounds.

## Logo

`assets/brand/ps-mark.svg` and `ps-lockup.svg` are true vectors traced from Paige's supplied
raster artwork, so the mark is resolution independent and has a transparent background. Both
are painted through CSS `mask-image` with `background-color: currentColor`, which means one
file tints to any brand color by setting `color` on the element. See `.logo-mark` and
`.logo-lockup` in the stylesheet.

`favicon.svg` carries only the PS letterforms, which stay legible at 16px, and switches to
ivory automatically in a dark browser chrome.

## Inquiry flow

`contact.html` holds a form that never posts anywhere. On submit, `main.js` assembles a
`mailto:` link to `paigesouthwickevents@gmail.com` with a prefilled subject and a formatted
body, then hands it to the visitor's own mail client. Nothing is transmitted until the
visitor sends the message themselves.

Package links from the services page carry a query string, for example
`contact.html?package=day-of`, which preselects the matching option. Accepted values are
`full-service`, `partial`, and `day-of`.

## Pricing

Standard prices only, taken from the authoritative pricing sheet image:
Full Service Planning `$5,000`, Partial Planning `$4,000`, Day Of Coordination `$2,000`.

The Friends and Family rates in the source sheet are private and must never appear in this
folder. A guard in the verification pass checks for them.

## Copy rule

No em dashes and no emojis anywhere in public copy or metadata.

## Deploying

Any static host works. For GitHub Pages, push this folder as the repository root or point
Pages at it, no workflow required since there is nothing to build. For Cloudflare Pages,
set the build command to none and the output directory to this folder.

Before launch, update the absolute URLs in `sitemap.xml`, `robots.txt`, and the `canonical`
and `og:image` tags in each page's head to the real domain.
