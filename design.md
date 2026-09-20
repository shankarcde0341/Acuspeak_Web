# Acuspeak Web — Design System

> **Purpose:** Single source of truth for all UI in the Acuspeak **web** project (`acuspeak-web`, Next.js App Router).
> Read this file BEFORE creating or editing any page or component. Every value below is exact — reuse tokens, do not invent new colors, sizes, or radii.
> This web project is maintained separately from the mobile app. Only the visual identity is shared.

---

## 1. Implementation Rules (Web)

- Framework: Next.js (App Router) + TypeScript. Project root contains `src/app`, `src/components`, `src/lib`.
- Styling: Tailwind v4 is allowed for layout utilities. Never write unlayered global resets (`* {}`, bare element selectors). All global element styles must live inside `@layer base`. Colors, radii, spacing and shadows must still come from the design tokens in Section 2. Component styles may also use **CSS Modules** (`Component.module.css`).
- CSS Modules rules:
  - Every selector must contain at least one class. Never write bare element selectors (`header {}`, `nav ul a:hover {}`) in a module — use `.header`, `.navLinks a:hover`.
  - Class names are camelCase (`.eyebrowPill`, `.featureCard`).
  - Element selectors (`h1, h2, h3`, `body`, `a`, `*` reset) live only in `globals.css`.
- Always reference tokens with `var(--token)`. Never hardcode a hex value that already exists as a token.
- Media queries cannot use CSS variables — write raw pixel values (see Breakpoints).
- Fonts are loaded with `next/font/google` in `src/app/layout.tsx` and exposed as `--font-outfit` and `--font-manrope`. Use `font-family: var(--font-outfit), sans-serif;` and `font-family: var(--font-manrope), sans-serif;`. Never use a `<link>` tag for fonts and never write `'Outfit'` / `'Manrope'` as literal font names.
- Components are **Server Components by default**. Add `"use client"` only when a component needs state, effects, or browser APIs (e.g. `NavLinks`, `UserMenu`).
- TypeScript: define interfaces for all props. No `any`.
- Inline `style={{}}` only for values that are dynamic per item (e.g. tinted icon backgrounds from a data array, waveform bar heights). Everything else goes in the CSS Module.
- Icons: inline SVG with `stroke="currentColor"`, `strokeWidth` 2 to 2.5, rounded caps and joins, sizes 16 to 44. Emoji are used as feature icons on the landing page. Do not add an icon library.
- Quotes and apostrophes in JSX text must be escaped (`&apos;`, `&ldquo;` `&rdquo;`) or wrapped in `{"..."}`.
- Internal navigation uses `next/link`. `mailto:` and `#anchor` links use `<a>`.

---

## 2. Design Tokens

Paste this block into `src/app/globals.css`. If any token is missing there, add it.

```css
:root {
  /* Brand */
  --primary: #1E3A8A;
  --primary-light: #3B82F6;
  --primary-deeper: #0F1F5C;
  --accent: #0D9488;
  --gold: #F59E0B;
  --flame: #EF4444;

  /* Surfaces */
  --bg: #F5F8FF;
  --surface: #FFFFFF;
  --glass: rgba(255,255,255,0.72);
  --glass-border: rgba(255,255,255,0.55);

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;

  /* Lines, chips, status */
  --divider: #E2E8F0;
  --chip-bg: rgba(59,130,246,0.10);
  --chip-active: #1E3A8A;
  --success-bg: #DCFCE7;
  --danger: #DC2626;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #1E3A8A, #2563EB, #38BDF8);   /* logo mark, avatars */
  --gradient-cta: linear-gradient(120deg, #1E3A8A, #2563EB, #38BDF8);       /* primary buttons */
  --gradient-text: linear-gradient(120deg, #1E3A8A, #2563EB 60%, #0D9488);  /* hero highlighted text */
  --gradient-soft: linear-gradient(180deg, #DBEAFE, #F5F8FF);               /* light hero / header fills */
  --gradient-gold: linear-gradient(135deg, #FBBF24, #F59E0B);
  --gradient-avatar-blue: linear-gradient(135deg, #3B82F6, #1E3A8A);
  --gradient-dark: linear-gradient(135deg, #0B1338, #1E3A8A);
  --gradient-premium: linear-gradient(120deg, #0F172A, #1E3A8A 55%, #312E81); /* dark bands / premium areas */

  /* Spacing */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;

  /* Radius */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-xl: 28px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-soft: 0 4px 12px rgba(15,23,42,0.06);
  --shadow-card: 0 10px 24px rgba(30,58,138,0.08);
  --shadow-strong: 0 12px 20px rgba(29,78,216,0.35);
  --shadow-cta: 0 10px 24px rgba(30,58,138,0.28);
  --shadow-hero: 0 20px 48px rgba(15,23,42,0.10);

  /* On-dark (call screen) */
  --on-dark-fill: rgba(255,255,255,0.12);
  --on-dark-border: rgba(255,255,255,0.25);
  --on-dark-text: rgba(255,255,255,0.7);
  --on-dark-accent: #93C5FD;
  --backdrop: rgba(15,23,42,0.82);
}
```

### Global base styles (`globals.css`)

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-manrope), sans-serif;
  background: var(--bg);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 {
  font-family: var(--font-outfit), sans-serif;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
a { color: inherit; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
```

### Premium accent (only for premium indicators)

- `premiumOrange`: `#FF7A00`. Use only for PRO tags and premium avatar rings. Light and dark variants are defined in the mobile app's `frontend/src/theme.ts` — copy them from there if needed.
- Never use orange for general UI, buttons, or links.

---

## 3. Typography

Two families only: **Outfit** for headings, buttons, labels, nav. **Manrope** for body copy and supporting text.

Loaded weights: Outfit 500, 600, 700, 800. Manrope 400, 500, 600, 700.

### App-wide text scale (dashboard and product screens)

| Style | Font | Size | Weight | Extra | Color |
|---|---|---|---|---|---|
| h1 | Outfit | 32px | 700 | letter-spacing -0.02em | `--text-primary` |
| h2 | Outfit | 24px | 700 | letter-spacing -0.02em | `--text-primary` |
| h3 | Outfit | 18px | 600 | | `--text-primary` |
| body | Manrope | 15px | 500 | | `--text-primary` |
| small | Manrope | 13px | 400 | | `--text-secondary` |
| tiny | Manrope | 11px | 600 | uppercase, letter-spacing 1.2px | `--text-muted` |
| button | Outfit | 15px (16px on large CTAs) | 600 | | `#fff` |

### Marketing (landing page) display sizes

| Element | Size | Weight | Notes |
|---|---|---|---|
| Hero h1 | 48px (34px at max-width 540px) | 700 | line-height 1.08. Highlighted phrase uses `--gradient-text` as text fill |
| Hero lead paragraph | 17px | 400 | `--text-secondary`, max-width 480px |
| Section h2 | 32px | 700 | |
| Dark band h2 | 28px | 700 | white |
| Contact card h2 | 26px | 700 | |
| Card h3 | 17px | 600 | |
| List item h3 | 16px | 600 | |
| Section kicker | 13px | 700 | `--accent` |
| Section paragraph | 15.5px | 400 | `--text-secondary` |
| Card paragraph | 14px | 400 | `--text-secondary` |
| Nav link | 14px | 600 | Outfit for dashboard pills, Manrope for marketing nav |

Highlighted gradient text:

```css
.highlight {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

---

## 4. Layout and Breakpoints

- Page container: `.wrap` (max-width 1080px, centered, horizontal padding 24px). The navbar's inner container uses the same max-width and padding.
- Main screen background: `--bg`. Cards and elevated panels: `--surface`.
- Marketing sections: `padding: 72px 0`. Section header block: `max-width: 560px; margin-bottom: 48px`.
- Dashboard content lives in `<main className="wrap">` under the navbar. Vertical page padding: `--space-xl`.

| Breakpoint (max-width) | What changes |
|---|---|
| 860px | Hero grid becomes 1 column. Feature grid becomes 2 columns |
| 760px | Dark band grid becomes 1 column, band padding becomes `40px 26px` |
| 720px | Marketing nav links hidden. Dashboard nav links wrap to a full-width centered row below (`order: 3; width: 100%`) |
| 560px | Feature grid becomes 1 column |
| 540px | Hero h1 becomes 34px. Dashboard username text hidden (avatar and chevron only) |

---

## 5. Component Specs

### 5.1 Logo (`Logo.tsx`, props: `size`)

- Mark: 34x34px square (26x26px in footer), `border-radius: 10px`, background `--gradient-primary`, white letter "A", Outfit 700, 16px (12px in footer), centered, `flex-shrink: 0`.
- Wordmark: "Acuspeak", Outfit 700, 20px (15px in footer), gap 10px from the mark.
- Wrap in `next/link` when used in navbars.

### 5.2 Buttons

Shared: Outfit 600, 15px, `padding: 14px 28px`, `border-radius: var(--radius-pill)`, `display: inline-block`, `text-decoration: none`, `cursor: pointer`.

| Variant | Background | Text | Border | Shadow |
|---|---|---|---|---|
| Primary | `--gradient-cta` | `#fff` | none | `--shadow-cta` |
| Secondary | `--surface` | `--text-primary` | `1px solid var(--divider)` | none |
| Small (modifier) | — | font-size 14px | — | `padding: 10px 20px` |
| Disabled (primary) | `linear-gradient(120deg, #CBD5E1, #94A3B8)` | `#fff` | none | none, `cursor: not-allowed` |

Hover (recommended): primary lifts by `transform: translateY(-1px)`. Secondary gets `border-color: var(--primary-light)`. Transitions 0.2s.

Primary buttons are the highest-contrast element on any screen. Use at most one per view section.

### 5.3 Marketing navbar

- `<header>` sticky, `top: 0`, `z-index: 20`, background `--glass`, `backdrop-filter: blur(14px)`, bottom border `1px solid var(--glass-border)`.
- Inner nav: max-width 1080px, `padding: 16px 24px`, flex, space-between, centered vertically.
- Left: Logo. Center: list of anchor links, gap 32px, Manrope 600 14px, color `--text-secondary`, hover `--primary`. Right: Small secondary button ("Get in touch").
- Links hidden at max-width 720px.

### 5.4 Dashboard navbar

Same glass header as 5.3, plus `box-shadow: var(--shadow-soft)`.

Layout: Logo (left, links to `/dashboard`), nav pills (center), user menu (right).

- **Nav pills** (Lessons, Practice, Live): `padding: 8px 16px`, `border-radius: pill`, Outfit 600 14px, color `--text-secondary`, gap between pills `--space-xs`. Hover: background `--chip-bg`, color `--primary`. **Active** (current route or nested route): background `--chip-active`, color `#fff`, `aria-current="page"`.
- **User trigger button**: pill, `padding: 6px 12px 6px 6px`, background `--surface`, `1px solid var(--divider)`, Outfit 600 14px. Contains: 32px circular avatar (`--gradient-primary`, white initial, 13px, 700), user name (max-width 140px, ellipsis), 16px chevron (`--text-secondary`, rotates 180deg when open). Hover: `--shadow-soft`.
- **Dropdown**: absolutely positioned under the trigger, `right: 0`, `top: calc(100% + 8px)`, `min-width: 220px`, `padding: 8px`, background `--surface`, `1px solid var(--divider)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-card)`.
  - Items: full width, `padding: 10px 14px`, `border-radius: var(--radius-md)`, Manrope 500 15px, `--text-primary`, hover background `--chip-bg`.
  - Menu order: Update Profile, Settings, divider (1px `--divider`, margin `4px 8px`), Logout.
  - Logout item color: `--danger`.
- Behavior: closes on outside `pointerdown`, on `Escape`, and on item click. Trigger has `aria-haspopup="menu"` and `aria-expanded`. Dropdown has `role="menu"`, items `role="menuitem"`.
- The displayed user name comes from `getCurrentUser()` in `src/lib/user.ts` (dummy for now, database later). Do not hardcode names inside components.

### 5.5 Cards

| Card | Background | Radius | Padding | Shadow |
|---|---|---|---|---|
| Feature / content card | `--surface` | `--radius-lg` (22px) | 26px | `0 10px 24px rgba(30,58,138,0.06)` |
| Large panel (page, contact) | `--surface` | `--radius-xl` (28px) | `--space-xl` (contact: 44px) | `--shadow-card` (contact: `0 12px 30px rgba(15,23,42,0.06)`) |
| Hero / voice card | `--surface` + `1px solid var(--glass-border)` | `--radius-xl` | 26px | `--shadow-hero` |
| Glass card | `--glass` + `1px solid var(--glass-border)` + `backdrop-filter: blur(14px)` | `--radius-xl` | 18px | `--shadow-soft` |

Feature card icon tile: 44x44px, `border-radius: 12px`, centered, 20px emoji or icon, `margin-bottom: 18px`. Tinted backgrounds:

| Tone | Background | Icon color |
|---|---|---|
| Primary | `rgba(59,130,246,0.12)` | `--primary` |
| Accent | `rgba(13,148,136,0.12)` | `--accent` |
| Gold | `rgba(245,158,11,0.14)` | `--gold` |
| Flame | `rgba(239,68,68,0.10)` | `--flame` |

Feature grid: 3 columns, gap 20px.

### 5.6 Section header (`SectionHead`)

Kicker (accent, 13px, 700, margin-bottom 10px), then h2 (32px, margin-bottom 14px), then paragraph (15.5px, `--text-secondary`). Left-aligned, max-width 560px.

### 5.7 Numbered step list

Rows: `display: grid; grid-template-columns: 56px 1fr; gap: 20px; padding: 22px 0; border-top: 1px solid var(--divider)`. The last row also gets a bottom border. Number chip: 40x40px, `border-radius: 12px`, background `--chip-bg`, color `--primary`, Outfit 700 15px, centered. Title h3 16px, description 14px `--text-secondary`.

### 5.8 Hero

- `padding: 96px 0 80px`, `overflow: hidden`, `position: relative`.
- Decorative glow (pseudo-element): 480x480px circle at `top: -180px; right: -160px`, `background: radial-gradient(circle at 30% 30%, rgba(56,189,248,0.28), rgba(30,58,138,0) 70%)`, `pointer-events: none`.
- Grid: `1.1fr 0.9fr`, gap 56px, centered vertically.
- Order: eyebrow pill, h1, lead paragraph (margin-bottom 34px), CTA row (gap 14px, wrap).

### 5.9 Chips and pills

- **Eyebrow pill**: inline-flex, gap 8px, background `--chip-bg`, color `--primary`, 13px 600, `padding: 7px 14px`, radius pill, `margin-bottom: 24px`.
- **Live badge**: background `--success-bg`, color `#15803D`, 12px 700, `padding: 5px 10px`, radius pill, with a 6px round dot in the same green before the label.
- **Danger states** use `--danger` text on a light tint. Do not use `--flame` for errors.

### 5.10 Voice card content (hero mock)

- Header row: room title (Outfit 600 15px) left, Live badge right, `margin-bottom: 20px`.
- Chat bubble row: 38px circular mini avatar + bubble. Avatar variants: gold (`--gradient-gold`) and blue (`--gradient-avatar-blue`), white Outfit 700 14px initial. Bubble: background `--bg`, radius 14px, `padding: 12px 16px`, 13.5px, max-width 260px. Row gap 12px, `margin-bottom: 16px`.
- Waveform: flex row, gap 3px, `margin-top: 20px`, `padding: 14px 16px`, background `--bg`, radius 14px. Bars: 3px wide, radius 2px, `--primary-light`, heights from data array `[10,18,26,14,30,20,12,24,16,22,10,18,28,14,20]`. Render with `map()` in JSX, `aria-hidden="true"`.

### 5.11 Dark band

- Background `--gradient-premium`, white text, `border-radius: 32px`, `padding: 56px 40px`, `overflow: hidden`.
- Grid `1.2fr 1fr`, gap 40px, centered vertically.
- h2 28px white. Paragraph: `rgba(255,255,255,0.78)`, 15px, max-width 460px.
- Stats row: gap 28px, wrap. Number: Outfit 30px, block. Label: 12.5px, `rgba(255,255,255,0.65)`.

### 5.12 Contact card

Centered text, `--surface`, radius 28px, padding 44px. h2 26px (margin-bottom 10px), paragraph 15px `--text-secondary` (margin-bottom 26px), then a primary button.

### 5.13 Footer

- `padding: 40px 0 60px`.
- Row: flex, space-between, wrap, gap 16px, `padding-top: 28px`, `border-top: 1px solid var(--divider)`, 13px, `--text-muted`.
- Left: small Logo. Center: links (gap 22px, 600, `--text-secondary`, hover `--primary`, no underline): Privacy Policy, Terms of Service, Contact. Right: "© 2026 Acuspeak. All rights reserved."

### 5.14 Form inputs (derived from the app's design guidance, not present in the landing page)

- Height about 48px, `padding: 12px 16px`, `border-radius: var(--radius-md)`, `1px solid var(--divider)`, background `--surface`, Manrope 500 15px, placeholder `--text-muted`.
- Focus: `border-color: var(--primary-light)` and `box-shadow: 0 0 0 3px var(--chip-bg)`. No default browser outline.
- Error: `border-color: var(--danger)`, helper text 13px `--danger`.
- Label: Outfit 600 14px above the field, gap 6px. Helper text: 13px `--text-secondary`.

### 5.15 Progress ring

Circular SVG progress with rounded stroke cap. Track `#E2E8F0`, progress stroke `--primary-light`. Center label Outfit 700.

### 5.16 Placeholder page (`PlaceholderPage`)

Wrapper `padding: var(--space-xl) 0`. Card: `--surface`, `--radius-xl`, padding `--space-xl`, `--shadow-card`. h1 32px 700 (`margin-bottom: 8px`), paragraph 15px 500 `--text-secondary`.

---

## 6. Interaction and Accessibility

- Transitions: 0.2s on `background`, `color`, `transform`, `box-shadow`, `border-color`. Nothing slower than 0.3s. Any decorative animation must respect `@media (prefers-reduced-motion: reduce)`.
- Focus: every interactive element needs a visible `:focus-visible` style: `outline: 2px solid var(--primary-light); outline-offset: 2px;`.
- Semantic HTML: one `<h1>` per page, `<header>`, `<nav aria-label="Primary">`, `<main>`, `<footer>`. Decorative elements get `aria-hidden="true"`.
- Icon-only buttons need `aria-label`.
- Body text stays on `--text-primary` or `--text-secondary`. `--text-muted` is for tiny labels, helper text, and footer only.

---

## 7. Design Rules (Do and Don't)

Do:
- Keep the cool blue-first palette with gold, teal (accent), and flame used sparingly for accents.
- Use bold Outfit headings and calm Manrope body text.
- Use soft rounded corners and layered white or translucent surfaces on the `--bg` background.
- Keep primary gradient CTAs as the strongest contrast on the page.
- Build new pages by composing existing components and tokens.

Don't:
- Don't add new colors, fonts, radii, or shadows. If something is missing, propose a token first.
- Don't use sharp corners (anything under `--radius-sm`, except 2px waveform bars and 1px dividers).
- Don't add a dark mode. It is not part of this design system.
- Don't use orange outside premium indicators.
- Don't use inline styles for static values, or global element selectors inside CSS Modules.

---

## 8. Route Map (current)

| Route | Purpose | Layout |
|---|---|---|
| `/` | Marketing landing page | Root layout, marketing navbar |
| `/privacy`, `/terms` | Legal pages | Root layout |
| `/dashboard`, `/lessons`, `/practice`, `/live`, `/profile`, `/settings` | Logged-in area (static placeholders for now) | `src/app/(dashboard)/layout.tsx`, dashboard navbar |

Dashboard pages set `robots: { index: false, follow: false }`.

---

## 9. Agent Checklist (before finishing any UI task)

1. Every color, radius, space, and shadow comes from a token in Section 2.
2. Fonts use `var(--font-outfit)` / `var(--font-manrope)`.
3. Styles are in a CSS Module with class-only selectors. No new global element styles.
4. Component is a Server Component unless it truly needs client state.
5. Layout works at 860, 760, 720, 560, and 540px.
6. Interactive elements have hover, focus-visible, and correct ARIA attributes.
7. `npx tsc --noEmit` and `npm run build` pass with 0 errors.
8. If a token or component spec changed, update this file in the same change.
