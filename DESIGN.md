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
rounded:
  text: "6px"
  inner: "9px"
  block: "10px"
  rail: "12px"
  status: "9999px"
spacing:
  hair: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  gutter: "20px"
  gutter-wide: "24px"
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
---

# Design System: REV — public programme page

Scope: the public page of a programme (`src/components/public/**`, shell in `src/components/public/app/ProgrammeApp.tsx`). The marketing site of REV (`src/components/pages/**`, `src/components/rev/**`) is a different, older surface (Space Grotesk and Inter, rounded pills, scroll reveals) and does not follow this file. Nor do the shadcn theme tokens of `src/styles.css` (`--background`, `--primary`…): the public page writes its own values.

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
