---
name: Aathr Consulting
description: أثرٌ يبقى / Impact that stays. Open-source IT services for Saudi and Egyptian businesses.
colors:
  obsidian-navy: "#0a2540"
  navy-night: "#050d1a"
  navy-deep: "#061426"
  navy-ink: "#0a1e38"
  navy-harbor: "#10375c"
  navy-steel: "#1b4975"
  navy-horizon: "#2a6496"
  champagne-gold: "#d4af37"
  gold-pale: "#fae8a4"
  gold-light: "#e9c869"
  gold-burnished: "#b8962e"
  gold-antique: "#8c6e1c"
  ink-on-gold: "#071322"
  whatsapp-green: "#25d366"
  page-mist: "#f8fafc"
  surface-white: "#ffffff"
  surface-subtle: "#f1f5f9"
  surface-alt: "#edf2f7"
  text-ink: "#0f172a"
  text-slate: "#334155"
  text-muted: "#64748b"
  text-faint: "#94a3b8"
  border-hairline: "#e2e8f0"
  border-medium: "#cbd5e1"
  dark-page: "#060f1c"
  dark-surface: "#0a192f"
  dark-surface-raised: "#0e223f"
  dark-border: "#182c48"
typography:
  display:
    fontFamily: "Tajawal, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.4rem, 4.8vw, 3.8rem)"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Tajawal, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Tajawal, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Tajawal, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  body-en:
    fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  lead:
    fontFamily: "Tajawal, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Tajawal, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 700
    letterSpacing: "0.04em"
rounded:
  sm: "8px"
  md: "14px"
  lg: "20px"
  full: "9999px"
spacing:
  gutter: "24px"
  container: "1320px"
  section: "100px"
  section-band: "80px"
  header-gap: "60px"
components:
  button-primary:
    backgroundColor: "{colors.champagne-gold}"
    textColor: "{colors.ink-on-gold}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "13px 28px"
  button-primary-lg:
    backgroundColor: "{colors.champagne-gold}"
    textColor: "{colors.ink-on-gold}"
    rounded: "{rounded.md}"
    padding: "16px 36px"
  button-outline-dark:
    backgroundColor: "transparent"
    textColor: "{colors.obsidian-navy}"
    rounded: "{rounded.sm}"
    padding: "13px 28px"
  button-outline-dark-hover:
    backgroundColor: "{colors.obsidian-navy}"
    textColor: "{colors.surface-white}"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "13px 28px"
  section-badge:
    backgroundColor: "{colors.champagne-gold}"
    textColor: "{colors.gold-antique}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  input-field:
    backgroundColor: "{colors.page-mist}"
    textColor: "{colors.text-ink}"
    rounded: "{rounded.sm}"
    padding: "13px 16px"
  service-card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "34px 28px"
  cta-band:
    backgroundColor: "{colors.obsidian-navy}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "48px 52px"
  nav-link:
    textColor: "{colors.text-slate}"
    padding: "8px 0"
  nav-link-active:
    textColor: "{colors.gold-antique}"
---

# Design System: Aathr Consulting

## 1. Overview

**Creative North Star: "The Lasting Mark"**

The site is built around the tagline أثرٌ يبقى, *Impact that stays*. Every surface should feel like work that will still be standing in five years: deep obsidian navy as the ground, champagne gold as the mark left on it, and generous quiet space between them. Nothing is decorative for its own sake; the gold appears where something has been achieved or where the visitor should act.

The system is Arabic-first. Tajawal carries the voice in right-to-left layout, Plus Jakarta Sans takes over in English, and both directions are designed, not mirrored. Density is calm: sections breathe at 100px vertical padding, content sits inside a 1320px container with 24px gutters, and headers stop at 780px wide so headlines read as statements, not banners. A light and a dark theme both exist and both must hold.

This system rejects the **old-school IT company** look named in PRODUCT.md: clip-art servers and network cables, cluttered pages, stacked banners, dated corporate stock photos, walls of service bullet points. It also refuses to let cost-effectiveness read as "cheap vendor"; restraint and precision are how a fair price looks expensive.

**Key Characteristics:**
- Obsidian navy ground, champagne gold mark, slate-cool neutrals.
- Arabic-first RTL with first-class English LTR.
- Mostly flat surfaces; depth appears in response to the visitor.
- Heavy headline weights (800 to 900) against relaxed 1.7 body leading.
- One clear action per view: book the free consultation.

## 2. Colors: The Lasting Mark Palette

A fixed navy-and-gold identity. **These colors are locked; design work changes where and how much they appear, never the values.**

### Primary
- **Obsidian Navy** (`obsidian-navy`): the brand ground. Hero backgrounds, the CTA band, outline-button strokes, footer. Supported by a seven-step scale from **Navy Night** (darkest, hero overlays) through **Navy Ink**, **Navy Harbor**, **Navy Steel**, to **Navy Horizon** (lightest, used sparingly for links on dark).

### Secondary
- **Champagne Gold** (`champagne-gold`): the mark. Primary buttons, active nav underline, focus accents, section badges, the service-card top rule on hover. Supported by **Gold Pale** and **Gold Light** (gold on navy backgrounds, dark-theme accents), **Gold Burnished**, and **Gold Antique** (gold text on light backgrounds, where pure gold fails contrast).
- **Ink on Gold** (`ink-on-gold`): the only text color allowed on a gold fill.

### Tertiary
- **WhatsApp Green** (`whatsapp-green`): reserved for the WhatsApp button only. It is a platform color, not a brand color.

### Neutral
- **Page Mist** (`page-mist`): light-theme page background; also input fill.
- **Surface White** (`surface-white`): cards and raised panels in light theme.
- **Surface Subtle / Surface Alt**: alternating section bands and quiet fills.
- **Text Ink** (`text-ink`): headlines and primary text. **Text Slate**: body copy and nav. **Text Muted**: subtitles and secondary copy. **Text Faint**: icons inside inputs, decorative numerals.
- **Border Hairline / Border Medium**: card outlines and section dividers.
- **Dark Page, Dark Surface, Dark Surface Raised, Dark Border**: the dark-theme equivalents, all navy-tinted, never neutral black.

### Named Rules
**The Locked Palette Rule.** The navy and gold values in the frontmatter are final. Never introduce a new hue, never shift these hexes, never "refresh" the palette.

**The Gold Is Earned Rule.** Gold marks action or achievement: the primary CTA, the active state, the badge above a heading. If gold appears on something the visitor cannot act on and that does not signal accomplishment, remove it.

**The Readable Gold Rule.** On light backgrounds, gold text uses Gold Antique; on navy or dark surfaces, Gold Light or Champagne Gold. Never set Champagne Gold text on white.

## 3. Typography

**Arabic Font:** Tajawal (with -apple-system, Segoe UI, Roboto, sans-serif)
**English Font:** Plus Jakarta Sans (with Inter, -apple-system, Segoe UI, Roboto, sans-serif)

**Character:** Tajawal gives Arabic a clean, contemporary Gulf voice; Plus Jakarta Sans matches its geometric warmth in English. One family per language, no serif, no mono: the hierarchy comes from weight and scale.

### Hierarchy
- **Display** (900, clamp(2.4rem, 4.8vw, 3.8rem), 1.2): hero headline only, white on navy.
- **Headline** (800, clamp(2rem, 3.5vw, 2.75rem), 1.25, -0.015em): section titles.
- **Title** (800, clamp(1.6rem, 2.6vw, 2.2rem), 1.25): CTA band titles, service block titles.
- **Lead** (400, clamp(1.05rem, 1.4vw, 1.25rem), 1.8): hero subtext and section subtitles, capped near 740px.
- **Body** (400, 1rem, 1.7): running text. Cap paragraphs at 65 to 75ch.
- **Label** (700, 0.88rem, 0.04em, uppercase in English): section badges, form labels.

### Named Rules
**The One Family Per Language Rule.** Arabic is set in Tajawal, English in Plus Jakarta Sans. Never mix them inside one sentence-level element; Latin product names inside Arabic text inherit Tajawal.

**The Weight Carries Hierarchy Rule.** Headings are 800 to 900, body is 400. Nothing in between competes for attention; 600 is reserved for nav links.

## 4. Elevation

The system is **mostly flat**. Surfaces rest flat with a hairline border; depth appears as a response to the visitor (hover, focus, an open menu). All shadows are navy-tinted in light theme (`rgba(10, 37, 64, …)`), never neutral grey, and deepen to black-based shadows in dark theme. Gold glow is permitted only beneath the primary button.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 2px 8px rgba(10, 37, 64, 0.04)`): the faintest lift for cards at rest; often unnecessary.
- **Hover** (`box-shadow: 0 6px 20px rgba(10, 37, 64, 0.07)`): cards and links responding to pointer.
- **Raised** (`box-shadow: 0 14px 36px rgba(10, 37, 64, 0.1)`): open menus, sticky header after scroll.
- **Gold Glow** (`box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25)`, hover `0 8px 25px rgba(212, 175, 55, 0.4)`): primary button only.

### Named Rules
**The Flat At Rest Rule.** Nothing floats until the visitor touches it. If a resting card has a visible shadow at arm's length, the shadow is too strong.

## 5. Components

Components feel **steady and well-made**: firm corners, clear edges, motion that settles quickly with an exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`, 0.2s for state, 0.35s for layout reveals).

### Buttons
- **Shape:** gently rounded (8px); large buttons 14px.
- **Primary:** the champagne gold gradient (`#fce588 → #d4af37 → #aa8214` at 135°) with Ink on Gold text, 13px × 28px padding, 700 weight. Hover lifts 2px and strengthens the gold glow.
- **Outline Dark:** transparent with a 1px Obsidian Navy stroke and navy text; fills navy on hover. In dark theme the stroke and text turn gold.
- **Outline on Navy (hero):** a translucent white outline for secondary actions on the navy hero; fills white with navy text on hover.
- **WhatsApp:** WhatsApp Green fill, white text. Never used for any other action.
- **Focus:** a visible ring is mandatory on every button.

### Section Badge
- **Style:** a pill (9999px) with a soft gold tint, a translucent gold hairline, and Gold Antique label text (Gold Light in dark theme). Sits above section headlines.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** Surface White (light) / Dark Surface (dark), 1px Border Hairline.
- **Shadow Strategy:** flat at rest, Hover shadow on pointer (see Elevation).
- **Signature detail:** on hover, a 4px gold rule fades in along the top edge.
- **Internal Padding:** 34px × 28px.

### Inputs / Fields
- **Style:** Page Mist fill, 1.5px Border Medium stroke, 8px radius, 13px × 16px padding, with 46px reserved on the reading-start side for an icon.
- **Focus:** stroke turns Gold Antique (Champagne Gold in dark theme) plus a 4px soft-gold halo. No default outline.
- **Labels:** Label style, Text Slate, always visible above the field.

### Navigation
- **Style:** 600-weight links in Text Slate, 28px apart. Hover and active turn Gold Antique, with a 2px gold underline that grows from the reading-start edge (right in Arabic, left in English).
- **Header CTA:** a compact primary button (10px × 22px).
- **Mobile:** a 44px hamburger on Surface Subtle; the menu includes its own CTA.

### CTA Band (signature)
The closing ask on every page: an Obsidian Navy panel, 20px corners, 48px × 52px padding, Title-style white headline, muted blue-grey supporting text capped at 56ch, and a single primary button. It is the one place a full navy block appears below the hero.

### Service Block (signature)
Long-form service entries use a two-column grid (5fr / 7fr, 56px gap) separated by a Border Medium hairline instead of cards: number and title on one side, description, deliverables, and related work on the other.

## 6. Do's and Don'ts

### Do:
- **Do** keep every color exactly as defined in the frontmatter; change usage, never values.
- **Do** design Arabic RTL first, then verify English LTR, including the direction of underlines, icons, and input padding.
- **Do** reserve gold for actions, active states, and earned marks.
- **Do** use Gold Antique (`#8c6e1c`) for gold text on light backgrounds so it passes WCAG 2.1 AA.
- **Do** keep surfaces flat at rest and let shadows answer hover and focus.
- **Do** end every page with the navy CTA band pointing to the free consultation.
- **Do** honor `prefers-reduced-motion` for every reveal and hover lift.

### Don't:
- **Don't** look like an **old-school IT company**: no clip-art servers and network cables, no cluttered pages, no stacked banners, no dated corporate stock photos, no walls of service bullet points.
- **Don't** let low cost read as "cheap vendor": no discount badges, starbursts, or price shouting.
- **Don't** use gradient text. The gold gradient lives on primary buttons only; headings and emphasis use solid gold.
- **Don't** use `border-left` or `border-right` wider than 1px as a colored accent stripe on cards, callouts, or list items.
- **Don't** use glassmorphism beyond the single translucent outline button on the navy hero.
- **Don't** build rows of identical icon-plus-heading cards; vary the structure or use the service-block layout.
- **Don't** put Champagne Gold text on white, or any text other than Ink on Gold on a gold fill.
- **Don't** use WhatsApp Green for anything but the WhatsApp action.
