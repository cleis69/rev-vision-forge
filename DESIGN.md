---
name: REV — public programme page
description: The sales plan of a real-estate programme on a phone, near-black with the promoter's colour (champagne by default).
colors:
  brand: "#c9a35b"
  brand-contrast: "#0a0a0a"
  page: "#080808"
  sheet: "#0d0d0d"
  surface-raised: "rgb(255 255 255 / 0.03)"
  surface-open: "rgb(255 255 255 / 0.04)"
  rule: "rgb(255 255 255 / 0.10)"
  rule-list: "rgb(255 255 255 / 0.07)"
  rule-control: "rgb(255 255 255 / 0.15)"
  ink: "#ffffff"
  ink-strong: "rgb(255 255 255 / 0.85)"
  ink-secondary: "rgb(255 255 255 / 0.60)"
  ink-quiet: "rgb(255 255 255 / 0.50)"
  selected: "#ffffff"
  on-selected: "#000000"
  status-reserved: "#fbbf24"
  status-reserved-ink: "#fcd34d"
  status-sold: "rgb(255 255 255 / 0.35)"
  whatsapp: "#25D366"
  error-ink: "#fca5a5"
  # Marketing-site world (site-*): see « Marketing site world » below. Not for src/components/public/**.
  site-ground: "#090909"
  site-card: "#111111"
  site-ink: "#f5f5f3"
  site-ink-muted: "#8a8a8a"
  site-rule: "#262626"
  site-rule-soft: "rgb(38 38 38 / 0.70)"
  site-champagne: "#c8a96a"
  site-champagne-hover: "#d9bd85"
  site-on-champagne: "#0b0b0b"
  site-bezel: "#161616"
typography:
  display:
    fontFamily: "var(--brand-font, 'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif)"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.42
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "var(--brand-font, 'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif)"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  numeral:
    fontFamily: "var(--brand-font, 'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif)"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontFeature: "'lnum', 'tnum'"
  title:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "'cv11', 'ss01'"
  label:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
  note:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
  site-display:
    fontFamily: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.15rem, 4.4vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  site-headline:
    fontFamily: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 3vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  site-numeral:
    fontFamily: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "'tnum'"
  site-question:
    fontFamily: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  site-function:
    fontFamily: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  site-function-compact:
    fontFamily: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  site-lead:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.625
  site-item:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.375
  site-body:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  site-action:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
  site-small:
    fontFamily: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  text: "6px"
  inner: "9px"
  block: "10px"
  rail: "12px"
  status: "9999px"
  site-inner: "8px"
  phone-screen: "2.35rem"
  phone-compact: "2rem"
  phone: "3rem"
spacing:
  hair: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  gutter: "20px"
  gutter-wide: "24px"
  site-gutter: "20px"
  site-gutter-wide: "40px"
  site-line: "16px"
  site-line-wide: "20px"
  site-part: "48px"
  site-part-wide: "80px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-contrast}"
    typography: "{typography.title}"
    rounded: "{rounded.block}"
    height: "48px"
    padding: "0 20px"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "{colors.on-selected}"
    rounded: "{rounded.block}"
    size: "48px"
  button-outline:
    textColor: "{colors.ink-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.block}"
    height: "44px"
    padding: "0 16px"
  choice:
    textColor: "{colors.ink-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.block}"
    height: "40px"
    padding: "0 14px"
  choice-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.on-selected}"
    rounded: "{rounded.block}"
    height: "40px"
    padding: "0 14px"
  rail:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.rail}"
    padding: "4px"
  rail-item-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.on-selected}"
    rounded: "{rounded.inner}"
    height: "36px"
    padding: "0 10px"
  status-pill-available:
    textColor: "{colors.brand}"
    typography: "{typography.note}"
    rounded: "{rounded.status}"
    padding: "4px 10px"
  status-pill-reserved:
    textColor: "{colors.status-reserved-ink}"
    typography: "{typography.note}"
    rounded: "{rounded.status}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.surface-open}"
    textColor: "{colors.ink}"
    rounded: "{rounded.block}"
    height: "48px"
    padding: "0 16px"
  block:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.block}"
    padding: "16px"
  register-line:
    textColor: "{colors.ink}"
    height: "68px"
    padding: "12px 16px 12px 20px"
  top-bar:
    backgroundColor: "{colors.page}"
    height: "52px"
    padding: "0 16px"
  site-cta-primary:
    backgroundColor: "{colors.site-champagne}"
    textColor: "{colors.site-on-champagne}"
    typography: "{typography.site-action}"
    rounded: "{rounded.block}"
    height: "48px"
    padding: "0 24px"
  site-cta-primary-hover:
    backgroundColor: "{colors.site-champagne-hover}"
    textColor: "{colors.site-on-champagne}"
    rounded: "{rounded.block}"
    height: "48px"
  site-cta-ghost:
    textColor: "{colors.site-ink}"
    typography: "{typography.site-action}"
    rounded: "{rounded.block}"
    height: "48px"
    padding: "0 24px"
  site-text-link:
    textColor: "{colors.site-ink}"
    typography: "{typography.site-small}"
    rounded: "{rounded.text}"
    height: "32px"
  site-register-line:
    textColor: "{colors.site-ink}"
    typography: "{typography.site-function}"
    padding: "{spacing.site-line-wide} 0"
  site-faq-row:
    textColor: "{colors.site-ink}"
    typography: "{typography.site-question}"
    rounded: "{rounded.text}"
    padding: "{spacing.site-line-wide} 0"
  site-phone:
    backgroundColor: "{colors.site-bezel}"
    rounded: "{rounded.phone}"
    width: "340px"
    height: "712px"
    padding: "10px"
  site-phone-launch:
    textColor: "{colors.site-ink}"
    typography: "{typography.site-action}"
    rounded: "{rounded.block}"
    height: "48px"
  site-product-mock:
    backgroundColor: "{colors.site-card}"
    rounded: "{rounded.block}"
---

# Design System: REV — public programme page

Scope: two worlds, kept apart. The sections from Overview to Do's and Don'ts describe the public page of a programme (`src/components/public/**`, shell in `src/components/public/app/ProgrammeApp.tsx`); it does not use the shadcn theme tokens of `src/styles.css` (`--background`, `--primary`…) and writes its own values. The marketing site of REV (`src/components/pages/**`, `src/components/rev/**`) is the second world, documented in « Marketing site world » at the end of this file, derived from the shipped offer page (`SalesPlanPage.tsx`); its tokens all start with `site-` (plus `phone*`) and never apply to the public page, as the public tokens never apply to it.

## Overview

**Creative North Star: "The sales plan that answers"**

The page is a sentence the buyer completes, « Je cherche une villa… », and the residence answers: the lots that fit stay lit on the 3D view and the list keeps only them. Everything else steps back. The ground is near-black, surfaces are raised by a few percent of white, and structure is drawn with white hairlines. The only colour that speaks is the promoter's (champagne when none is set), and it comes from data, not from the stylesheet.

It is an app, not a brochure: a fixed frame (top bar, stage, bottom action bar) with one scrolling column inside, built for a phone opened from a WhatsApp link. Density is compact; a lot is a register line, not a card. The image is never dressed up: no rounded frame, no margin, no overlay beyond the controls it needs.

**Key Characteristics:**
- Near-black ground, white hairlines, one data-driven brand colour.
- The promoter's font carries names, the sentence and lot numbers; Inter carries the interface.
- One corner (10px) for buttons and blocks; pills only say a status.
- Phone first: a 52px top bar, the 3D view full width, a fixed action bar at the bottom.
- Lots as register lines: number, facts, status, price at the right.
- French and English everywhere. No scroll-driven effects; movement lasts 150 to 300 ms.

## Colors

Near-black and white at many strengths, with a single colour supplied by the promoter.

### Primary
- **Brand (champagne by default)** (`brand`): set at runtime as `--brand` from the promoter's data (`src/lib/brand.ts`, `src/lib/public/theme.ts`); the token value is only the fallback. It marks what is available (dot, status text, lot tag and fill on the view), fills the main action (« Planifier une visite »), and underlines the words of the sentence the buyer can change. As a tint it is used at 15% under a status pill or an open word.
- **Brand contrast** (`brand-contrast`): text on the brand colour, computed as near-black or white, whichever reads better (`--brand-contrast`). Never hard-code it.

### Secondary
- **Reserved amber** (`status-reserved`, text `status-reserved-ink`): reserved lots only, on the view (hatched), in dots, pills and status text. Also the preview banner of the promoter.
- **WhatsApp green** (`whatsapp`): the WhatsApp action only, filled with black glyph; as an outline with lighter green text (#5fe08f) where it sits beside other outlined links.

### Neutral
- **Page black** (`page`): the frame, the top bar, the bottom bar.
- **Sheet black** (`sheet`): panels that slide over the page (lot sheet, sections menu, visit form, comparison dialog).
- **Raised surface** (`surface-raised`) and **open surface** (`surface-open`): blocks inside a sheet (payment plan, simulators) and the choice opened under the sentence, inputs. Hover and current rows use white at 4 to 10%.
- **Hairlines**: `rule` between regions and around blocks, `rule-list` between lines of a list, `rule-control` around controls. Hover strengthens a control's border to 40%.
- **Ink**: `ink` for values, prices, titles; `ink-strong` for control labels; `ink-secondary` for facts and helper lines; `ink-quiet` is the floor for text. Below 50% is for chevrons, placeholders and disabled marks.
- **Selected** (`selected` / `on-selected`): a white fill with black text says "this one is chosen" in a rail or a set of choices.
- **Sold graphite** (`status-sold`): sold lots, dimmed; their number and text drop to about half strength.
- **Error** (`error-ink`): form errors, on a red tint (red at 10%, border at 30%).

### Named Rules
**The Borrowed Colour Rule.** The colour belongs to the promoter. Always write `var(--brand)` and `var(--brand-contrast)`; never a champagne hex, never a Tailwind `primary`.

**The Three Statuses Rule.** Brand is available, amber is reserved, graphite is sold, identically on the view, in the list, on the sheet and in the legend. No fourth meaning borrows one of these colours.

**The White Means Chosen Rule.** In a rail or a group of choices, the chosen item is white with black text. The brand colour is not a selection colour.

## Typography

**Display Font:** the promoter's brand font, through the `font-brand` utility (`--brand-font`; Space Grotesk when none is set; six choices in `src/lib/brand.ts`, sans and serif).
**Body Font:** Inter Variable (with ui-sans-serif, system-ui), features `cv11` and `ss01`.

**Character:** The display face is not ours to pick, so it is used at one weight (500), tight tracking, and only where the programme speaks in its own name. Inter does all the work around it, quietly, at small sizes.

### Hierarchy
- **Display** (500, 22px / 1.42 on phones, 26px / 1.36 from 1024px, -0.01em): the sentence « Je cherche… ». Loose leading because its underlined words wrap.
- **Headline** (500, 24px, tight tracking; 30px from 640px for section titles): the programme's sections, the title of a sheet (« Lot A1 · Villa A »). Smaller steps of the same voice: 20px for a panel's key figure, 18px for a sub-title in a sheet, 16 to 18px for the programme name in the top bar.
- **Numeral** (500, 26px, line-height 1, lining and tabular figures): the lot number that opens a register line.
- **Title** (Inter 500, 15px): the label of the main action, rows of the sections menu. The price on a sheet is Inter 500 at 20px.
- **Body** (Inter 400, 14px; 16px in inputs and running text of the programme, relaxed leading): control labels, values, descriptions. 13px for the facts line of a lot and small outlined buttons.
- **Label** (Inter 400, 12px): status text, counts, helper lines, the language switch.
- **Note** (Inter 400 or 500, 11px): legal notes, the status pill, lot tags on the view.

### Named Rules
**The Two Voices Rule.** The brand font says names, the sentence, lot numbers and key figures. Every control, value, price and label is Inter. A price is never in the brand font.

**The Tabular Rule.** Every number that can change or stack (lot numbers, prices, counts, percentages) uses tabular figures.

## Layout

A fixed frame fills the screen (`fixed inset-0`, column): top bar, stage, bottom bar. Only the column inside scrolls; the bars never move.

- **Phone (reference, 390 wide).** Top bar 52px: logo and programme name at the left, FR / EN and the sections button at the right. Then the 3D view, full width, no margin and no radius. Then the sentence with its choices, the count row between two hairlines, the lots, the list of sections, « Propulsé par » with the REV logo. Bottom bar: the main action (48px high, filling the width) and a 48px WhatsApp square, with 10px above and the safe-area inset below.
- **From 1024px.** Top bar 64px with the sections as a rail in the middle and the two actions at the right; the bottom bar disappears. The view fills the left; the sentence and the lots sit in a fixed 440px column at the right, separated by a hairline, scrolling on its own.
- **Other sections** (programme, gallery, tours, location) use a centred container of 1152px with 20px gutters (32px from 640px) and 32 to 40px above and below, sections separated by a hairline.
- **Sheets.** The lot sheet is full width on a phone and 448px wide from 640px; its own action bar sticks to its bottom. Sheet padding is 24px.
- **Rhythm.** Gutter 20px (24px in the desktop column); 8px between sibling controls, 12px between an icon or number and its text, 16px inside a block. Touch heights: 48 (main action, inputs), 44 (secondary), 40 (choices), 36 (small controls), 32 (text-level controls); a lot line is at least 68px, a menu row 56px.
- **Motion.** State changes run 200ms on colour or opacity. The choice under the sentence fades and slides in from 4px above in 200ms; the count fades to its new value in 200ms; a line lit from the view appears in 150ms and fades over 700ms. The view's camera eases out over 500ms. Reduced motion removes all of it. Nothing is tied to scrolling.

## Elevation & Depth

Flat. Depth is said by tone: page black, sheet black one step up, blocks at 3 to 5% of white, and hairlines. Sheets and dialogs carry no visible shadow of their own.

The single exception is what floats on an image: controls over the 3D view, the 360° viewers and photos sit on black at 55 to 65% with a background blur, a 10 to 15% white border and a soft shadow, so they stay readable on any render.

### Shadow Vocabulary
- **On-image control** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` with `backdrop-filter: blur(8px)`): zoom and view rails over a view.
- **Lot tag** (`box-shadow: 0 2px 8px rgba(0,0,0,0.45)`): the number tags placed on the lots of the view.

### Named Rules
**The Blur Belongs To Images Rule.** Background blur and shadow appear only on a control that sits on a photo, a render or a viewer. On the page's own black, a surface is flat with a hairline.

## Shapes

One corner, gently rounded (10px), for every button, input, choice, block and square action. A rail that wraps controls is 12px with 4px of padding, and the controls inside are 9px, so the curves stay concentric. Text-level targets (a word of the sentence, the sort, a status filter, a lot tag on the view) take a 6px corner for their hover and focus shape. Full rounding is reserved for status: the pill and the dots. Images in the frame have square corners and run edge to edge.

Borders are 1px white hairlines; a dashed border means "add this" (the clauses not yet in the sentence). Focus is a 2px white ring at 70% (inset at 60% on full-width rows).

**The Pill Is A Status Rule.** If it is fully rounded, it states available, reserved or sold. Buttons, filters and tabs are never pills.

## Components

### Buttons
- **Shape:** gently rounded (10px), label Inter 500.
- **Primary:** brand fill, brand-contrast text, 48px high with a 18px icon at the left on the phone bars (40 to 44px in the desktop top bar and inside sections). One per bar.
- **WhatsApp:** green fill, black glyph, a 48px square beside the primary; named « WhatsApp » when it has the width.
- **Outline:** transparent, 15% white border, 85% white text, 44px (36px for small ones, 13px text); square 48px versions carry an icon alone (compare, share) in the sheet's bar.
- **Hover / Focus:** fills drop to 90% opacity, outlines go to a 40% border; 200ms; 2px white focus ring.

### Chips
- **Choice** (under the sentence, in simulators): 40px, 10px corner, 15% border; chosen is white with black text.
- **Add a clause:** 36px, dashed 25% border, a plus and the name (« Chambres », « Surface », « Budget »); turns brand while its choice is open.
- **Status filter:** text-level (32px, 6px corner), a dot, a tabular count and the status in lower case; chosen gets white at 10%, the others dim.
- **Status pill:** fully rounded, 11px 500, a 6px dot, on a 15% tint of its status colour. On a sheet, above the lot's title.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** white at 3% inside a sheet; white at 4% for the choice opened under the sentence.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px white at 10%.
- **Internal Padding:** 16px (14px for the open choice).
- **Disclosure blocks** (payment plan, loan, rental): a full-width row with a brand-tinted icon, a 500 label, a one-line summary at 55% and a chevron that turns; opened, a hairline then the content. Key result on a 5% white panel with the figure in the brand font.

### Inputs / Fields
- **Style:** 48px, 10px corner, white at 4%, 15% border, 16px text; label above in 14px at 80%, « (facultatif) » at 40%.
- **Focus:** border to 40% and a soft white ring.
- **Error:** border red at 70%, message in 12px light red under the field; a form-level error is a red-tinted block.
- **Range:** a native slider tinted with the brand colour, its value above in the brand font, an « OK » choice at the right.

### Navigation
- **Top bar:** page black, hairline under, 52px (64px from 1024px). Programme name in the brand font, town under it in 11px.
- **Language switch:** a 10px-cornered frame with 2px padding holding FR and EN (28px high, 9px corner); the current one is white with black text.
- **Sections, phone:** an outlined 36px button opens a side sheet (max 352px) of 56px rows: 18px icon, 15px label, a brand dot on the current one. The same rows close the column under the lots.
- **Sections, desktop:** a rail (12px, white at 3%, hairline) of 36px items with 9px corners; current is white with black text.

### The sentence (signature)
A heading in the brand font that reads as a sentence: « Je cherche une villa de type A, avec 3 chambres ou plus, jusqu'à 9 000 000 MAD. » Each clause the buyer can change is brand-coloured and underlined (1px, 6px offset, the underline at 45% until hover). Touching one opens its choice right under the sentence; choosing closes it. Clauses not yet said wait under the sentence as dashed « + » buttons. Below, between two hairlines: the count (« 6 villas correspondent »), the sort, the statuses with their counts and « Effacer ».

### Register line (signature)
One lot per line, at least 68px, separated by 7% hairlines, the whole line a button. Left: the lot number in the brand font (26px, a 56px column). Middle: the facts joined by « · » (13px at 70%), then the status with its dot. Right, on the status row: the price (Inter 500, tabular), then a chevron at 35%. Sold lots lose their price and dim. The line under the pointer or lit from the view takes white at 4 to 10%.

### On-view controls
A dark translucent rail (12px corner, black at 65%, blur, 15% border) holding 36px square buttons with 9px corners (44px in the sales-office mode). Lot tags on the view are small filled labels in the status colour with the lot number in 11px semibold.

## Do's and Don'ts

### Do:
- **Do** take the colour and the display font from `var(--brand)`, `var(--brand-contrast)` and `font-brand`; check a new surface with a second brand colour and a serif brand font.
- **Do** design at 390 wide first: 52px top bar, full-width view, fixed bottom bar with the main action.
- **Do** use the 10px corner for buttons and blocks, 12px for a rail around 9 to 10px controls, full rounding for statuses only.
- **Do** say a status the same way everywhere: brand, amber, graphite, each with its word.
- **Do** write every text in French and English, and give every number tabular figures.
- **Do** keep images edge to edge and untouched; put only translucent controls on them.
- **Do** keep « Propulsé par » and the REV logo on every public page.
- **Do** respect reduced motion; keep movement between 150 and 300ms on colour, opacity or a few pixels.

### Don't:
- **Don't** hard-code champagne or use the stylesheet's `primary`: the colour is the promoter's.
- **Don't** use the brand colour for a selected tab or choice; white says chosen.
- **Don't** make buttons, filters or tabs into pills.
- **Don't** put a lot in a card; a lot is a line.
- **Don't** set prices, labels or controls in the brand font.
- **Don't** tie any effect to scrolling, and don't bring the marketing site's reveals, gradient text or glass surfaces here.
- **Don't** add shadow or blur to a surface that sits on the page's black.
- **Don't** set text below 50% white.

---

## Marketing site world

Scope: REV's own marketing site (`src/components/pages/**`, `src/components/rev/**`, routes `/` and `/en`), recorded from the shipped offer page (`src/components/pages/SalesPlanPage.tsx` with `src/components/rev/SalesPlanDemo.tsx`, routes `/plan-de-vente-3d` and `/en/3d-sales-plan`) and the shared primitives of `src/components/rev/ui.tsx` (`Container`, `Cta`). It uses the shadcn theme of `src/styles.css`, so in code these tokens are written as theme utilities (`bg-background`, `text-primary`, `border-border/70`, `font-display`), not as literals; the `site-*` tokens are their recorded values. Nothing here applies to the public programme page above, and nothing above applies here. Subsections follow the canonical order.

### Overview

**Creative North Star: "La fiche technique"**

The page is the product's spec sheet, set beside the product itself: the real demo of a programme page inside a phone, then each function on a register line, grouped by who uses it (buyers, the developer's team, the studio, onboarding). Near-black ground, hairline rules, no cards, no labels above headings. Champagne is spent on three things only. The page is quiet so the phone can be the one lively object.

**Key Characteristics:**
- Near-black ground, rules at 70% of the border grey between lines, full-strength border above a list.
- Space Grotesk for headings, function names and step numerals; Inter for everything else.
- A heading says itself, with one phrase in champagne; no eyebrow, no gradient text.
- Functions on register lines, not in icon cards.
- The real demo in a phone frame: a capture first, the live page loaded into the same frame on launch.
- 10px corners; full rounding only for dots.

### Colors

#### Primary
- **Champagne** (`site-champagne`, theme `--primary`; hover `site-champagne-hover`, text on it `site-on-champagne`): the primary action, the accented phrase of a heading, and what REV does (the « REV » column head of the comparison, the « Nouveau » marker, step numerals, check marks and the « Ce que vous recevez » heading, the « live » dot and available status in the team mock). The hero's three facts carry 4px champagne dots at 70%. A FAQ question turns champagne on hover and its plus turns champagne when open.

#### Neutral
- **Ground** (`site-ground`): every part of the page. **Card** (`site-card`): only the team dashboard mock.
- **Ink** (`site-ink`): headings, function names, CTA labels; text links at 80%, the empty « — » cell at 30%, « · » separators at 25%.
- **Muted ink** (`site-ink-muted`): descriptions, function bodies, what the physical model and the PDF brochure do, notes.
- **Rules**: `site-rule` at full strength above a list, under a table head and under each FAQ row; `site-rule-soft` (the same grey at 70%) between register lines and at the top of each part.
- **Bezel** (`site-bezel`): the phone frame only, with a 1px white ring at 10%.

**The Three Champagnes Rule.** Champagne marks the primary action, one phrase per heading, and what REV does. What the competition (model, brochure) does stays muted grey; a neutral fact never borrows champagne.

### Typography

**Display Font:** Space Grotesk Variable (`--font-display`), weight 500 only, tight tracking.
**Body Font:** Inter Variable (`--font-sans`).

- **Display** (`site-display`): the h1, three lines at 1440 wide, balanced wrap.
- **Headline** (`site-headline`): each part's h2, balanced wrap, at most 768px wide.
- **Function** (`site-function`, 17px from 640px; `site-function-compact`, 16px below): the name of a function opening a register line or a comparison row; also, at 15px, the programme name in the team mock.
- **Question** (`site-question`, 18px from 768px, 16px below): FAQ questions.
- **Numeral** (`site-numeral`, tabular, champagne): onboarding step numbers.
- **Lead** (`site-lead`, 15px on phones, 16px from 768px, max 62ch): the description under a heading.
- **Item** (`site-item`, 15px 500): onboarding column heads and item titles.
- **Body** (`site-body`): function bodies (max 60ch) and FAQ answers.
- **Action** (`site-action`, 14px 500): CTA labels.
- **Small** (`site-small`, 13px): the hero facts and text links, comparison cells and table heads, onboarding details, final notes, the phone's close control.
- 12px and 11px reuse the `label` and `note` steps: the « Nouveau » marker (12px 500 champagne), the powered-by line, the team mock's small print.

**The Spec Sheet Voice Rule.** Space Grotesk names things (headings, functions, questions, step numbers); Inter explains them. The step ramp is 13 / 14 / 15 / 16 / 17 / 18 / 22 px plus the two clamps; a new step needs a reason.

### Layout

- **Container**: 1240px wide, gutters `site-gutter` on phones, 24px from 640px, `site-gutter-wide` from 768px.
- **Parts**: each part opens with a rule at 70% and runs `site-part` above and below (56px from 640px, `site-part-wide` from 1024px; 96px for the closing part). Heading, then the list 32px below (40px from 640px).
- **Register line**: a three-column grid. Function name in a 13rem column from 640px (15rem from 1024px), what it does beside it, an optional aside at the right from 1024px, baseline-aligned. `site-line` above and below on phones, `site-line-wide` from 640px. A rule at 70% under each line; the list carries a full-strength rule on top. On phones the name sits over its body with 4px between.
- **Comparison table** (buyers): the REV column takes the width; model and brochure columns 176px (208px from 1024px), 24px apart. On phones the table becomes lines and both answers fold into one 13px line under the function: « Maquette : … · Brochure : … ».
- **Hero**: text left, phone right (`1fr auto`, gaps 40 / 64 / 96px), vertically centred, top padding 112px (128px from 768px). Actions: full-width stacked with 10px between on phones, inline with 12px from 640px. Facts line 24px under the actions, text links 8px under that.
- **Two-column parts**: team lines beside a 22rem mock from 1024px (64px gap); onboarding « what you send / what you receive » in two equal columns from 1024px; FAQ heading 0.8fr beside the list 1.2fr; studio and final parts put the CTA at the right, bottom-aligned.
- **Motion**: the hero fades up 14px over 800ms (`cubic-bezier(0.16, 1, 0.3, 1)`), the phone 120ms after the text, by CSS on load. No scroll reveals and no split text on this page. CTA background 300ms with a 0.98 press; the ghost CTA's white-at-10% fill sweeps in from the left in 350ms; a FAQ answer opens by grid rows in 300ms on the same curve while its plus turns 45°; links and rows change colour in 200ms. Reduced motion collapses all of it.

### Elevation & Depth

Flat. The one object with depth is the phone: `0 40px 80px -32px rgb(0 0 0 / 0.9)` under a 1px white ring at 10%. The team mock is a bordered card surface with no shadow. On the capture inside the phone, a black gradient rises from the bottom (black from 25%, 80% midway) so the launch button reads on any render; that button is black at 60% with a background blur, as on-image controls are in the public world.

**The One Lit Object Rule.** Only the phone casts a shadow. Everything else on the page is ground, rule and type.

### Shapes

One corner, 10px (`block`), for CTAs, the launch button, the team mock and the status rail inside it; 8px (`site-inner`) for the segments and small buttons inside that mock. Text-level targets (text links, FAQ rows) take the 6px `text` corner for their focus shape. The phone: `phone` outside with a 10px bezel and `phone-screen` for the screen on desktop; `phone-compact` with an 8px bezel on phones and tablets. Full rounding only for 4 to 6px dots. Focus is a 2px white ring at 70%.

**The Dot Is Not A Pill Rule.** Nothing on the marketing page is a pill. Full rounding is for dots; statuses inside the mock are 8px segments.

### Components

- **Primary CTA** (`site-cta-primary`): « Prendre rendez-vous », champagne, 48px, 24px sides, 10px corner, an up-right arrow (16px) after the label. One per action group.
- **Ghost CTA** (`site-cta-ghost`): 48px, 1px `site-rule` border, transparent, ink label; « Essayer la démo », « Planifier un appel », the studio's contact link.
- **Text link** (`site-text-link`): 32px, 13px, ink at 80%, underline at 25% with a 4px offset (60% on hover), a 13px icon before: « Plein écran », « Mode présentation ».
- **Heading**: the h1 or h2 with one champagne phrase in the line, optional lead under it. No label above.
- **Register line** (`site-register-line`, signature): name, what it does, optional aside; the « Propulsé par » line with the compact REV logo (24px high) sits in the aside of the team's last line.
- **Comparison table**: a register list with two muted columns for the model and the brochure; the head row in 13px, « REV » in champagne.
- **Numbered and checked lists** (onboarding): 24px lead column holding the champagne numeral or an 18px champagne check, 15px 500 title, 13px muted detail, a 70% rule under each item.
- **FAQ row** (`site-faq-row`): the question and a plus (18px) on one row; first item open by default.
- **Phone with the real demo** (`site-phone`, signature): on desktop a 340 × 712 frame holding a 320 × 692 screen; the capture of the real demo page sits under a bottom gradient with the launch button (`site-phone-launch`, « Essayer comme un acheteur ») and a 12px note at 60% under it. Launching loads the real page (390 × 844, scaled to 0.8205) into the same screen, without a jump; a 36px text-level control under the phone closes it. On phones the frame is at most 360px wide and the whole capture is one link to the demo page.
- **Product mock** (`site-product-mock`): a picture of the team dashboard (`role="img"`), the only bordered card surface on the page, because it depicts the product's own UI: a header row, lots with a three-state status rail (champagne, amber at 80%, zinc), a notification row, CSV buttons.

### Do's and Don'ts

#### Do:
- **Do** open every part with a 70% rule and let the heading speak for itself, with one champagne phrase.
- **Do** put functions on register lines, name in Space Grotesk, explanation in Inter.
- **Do** show the real product in the phone frame rather than an illustration of it.
- **Do** use the 10px corner for every action; 48px for CTAs, 32px for text links.
- **Do** write every text in French and English and keep « Propulsé par » with the REV logo on the page.

#### Don't:
- **Don't** put a label, eyebrow or kicker above a heading, and don't set headings in gradient text.
- **Don't** lay functions out as a grid of icon cards; the only card surface is a product mock.
- **Don't** spend champagne on neutral facts or on what the model and brochure do.
- **Don't** make any button, filter or tab a pill.
- **Don't** add scroll-driven reveals or split-text entrances; the hero's CSS fade on load is the only entrance.
- **Don't** bring these `site-*` tokens or the theme `primary` into `src/components/public/**`.

### Drift (recorded, not canonized, not repaired)

The rest of the marketing site still speaks the older dialect. These are defects the build carries, not rules to inherit:
- **Eyebrow headings.** `AccentHeading` (`src/components/rev/AccentHeading.tsx`: an uppercase 11px tracked label with a champagne dot above a `text-gradient` heading at `clamp(1.75rem, 3.6vw, 3rem)`, h1 `clamp(2.1rem, 4.6vw, 3.9rem)`) is used by `AgentIA.tsx` and `AgentTeaser.tsx`. `SectionHeading` in `ui.tsx` (same eyebrow, split text, gradient) is used by `AboutPage`, `BrandingProgram`, `Ecosystem`, `Faq`, `Portfolio`, `ProcessSteps`, `Services`, `WhyRev`. `PageHero` in `ui.tsx` (eyebrow, split-text gradient h1 over a veiled photo) heads About, Contact, Insights, Portfolio, Pricing and Services.
- **Gradient text** beyond those primitives: the home hero (`Hero.tsx`, with a pill-shaped uppercase label and a 760px blurred glow behind), `AgentIA.tsx`, `FinalCta.tsx`.
- **Uppercase tracked micro-labels** (9 to 11px) in seventeen marketing files, including the home hero, `AgentIA`, `Portfolio`, `ProcessSteps`, `PricingPage`, `ServicesPage`.
- **Scroll reveals** (`Reveal`) in fifteen marketing files.
- **Pills as controls**: the portfolio filter tabs are fully rounded uppercase pills.
- **On the offer page itself**: the ghost CTA carries a background blur (`backdrop-blur-md`) from `Cta` that has nothing to blur on the page black; it is not part of the world.
