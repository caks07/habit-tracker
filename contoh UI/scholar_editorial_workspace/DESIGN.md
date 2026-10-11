---
name: Scholar Editorial Workspace
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dec0b7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a58b83'
  outline-variant: '#57423b'
  surface-tint: '#ffb59c'
  primary: '#ffb59c'
  on-primary: '#5c1900'
  primary-container: '#e46f45'
  on-primary-container: '#511500'
  inverse-primary: '#a23e18'
  secondary: '#a9cbe5'
  on-secondary: '#0e3448'
  secondary-container: '#284a60'
  on-secondary-container: '#98b9d3'
  tertiary: '#abd0af'
  on-tertiary: '#173720'
  tertiary-container: '#77997b'
  on-tertiary-container: '#103019'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#822801'
  secondary-fixed: '#c8e6ff'
  secondary-fixed-dim: '#a9cbe5'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#284a60'
  tertiary-fixed: '#c7ecca'
  tertiary-fixed-dim: '#abd0af'
  on-tertiary-fixed: '#02210c'
  on-tertiary-fixed-variant: '#2e4e35'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
  bg-base: '#141414'
  surface-card: '#202020'
  surface-elevated: '#2A2A2A'
  surface-border: '#383838'
  accent-terracotta: '#C85A32'
  accent-terracotta-subtle: rgba(200, 90, 50, 0.15)
  accent-blue: '#4E79A7'
  accent-blue-subtle: rgba(78, 121, 167, 0.15)
  accent-green: '#59A14F'
  accent-green-subtle: rgba(89, 161, 79, 0.15)
  accent-yellow: '#EDC949'
  text-primary: '#F0EDE6'
  text-secondary: '#A8A49C'
  text-muted: '#686560'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Courier Prime
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Courier Prime
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Courier Prime
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Courier Prime
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Courier Prime
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a stark, brutalist lo-fi editorial aesthetic tailored for deep-work knowledge hubs, academic wikis, and structured personal productivity. It marries the tactical precision of a terminal workspace with the warmth and nostalgia of editorial archiving. 

The visual identity relies on sharp geometric contrasts: technical headline structure using Space Grotesk pitted against literary, typewriter-grade monospaced text via Courier Prime. The mood is contemplative, organized, and focused—subverting corporate sterility through rich terracotta, slate, moss, and muted sky accents against deep layered charcoals. Tactile modularity guides the user interface, treating digital sections as physical indexing cards, archive blocks, and classified dossier files.

## Colors

The palette is engineered for prolonged focus in dark environments, anchored by a tiered charcoal bedrock:
- Canvas base sits at `#141414`, moving to `#202020` for foundational container blocks and `#2A2A2A` for elevated states or nested content.
- Contrast boundaries are drawn with fine hairline borders using `#383838`, rejecting fuzzy dropshadows in favor of crisp architectural divisions.
- Primary accentuation stems from `#C85A32` (terracotta), which introduces warmth and editorial gravity to tags, active tabs, and critical focus states.
- Functional semantic tags leverage muted, low-saturation earth-tinted pills: `#59A14F` (moss green) for progress/active states, `#4E79A7` (slate blue) for analytical sections, and `#EDC949` (muted amber) for alerts and weather indicators.

## Typography

Typography establishes an intentional aesthetic tension between forward-facing technical clarity and historic typewriter record-keeping:
- `Space Grotesk` delivers bold, slightly idiosyncratic structural headers for database names, board views, and page titles.
- `Courier Prime` powers all reading matter, database records, schedules, and metadata tags. Its fixed-pitch cadence creates an organized tabular flow across unstructured text notes.
- Subheaders, block tags, and status markers often adopt an uppercase or spaced-out lowercase format (e.g. `a b o u t   m e`) to evoke early digital archiving conventions.

## Layout & Spacing

The layout is built around a rigorous modular block grid designed to mirror personal digital workspaces:
- Fixed-margin outer gutters frame an editorial central canvas with a maximum reading width of 1180px for desktop viewing, scaling fluidly across mobile views.
- Inner layout components (such as Gallery cards, Kanban columns, and Table records) adhere to an 8px base rhythm.
- Vertical block flow favors deliberate breathing room between contextual modules (`space-xl`), while data-dense interiors (timelines, daily tasks) utilize tight, compact gap metrics (`space-xs` and `space-sm`) to maximize visible information density without visual noise.

## Elevation & Depth

This design system deliberately eschews standard drop shadows, blurs, and glassmorphism. It uses low-contrast architectural stacking and strict hairline borders:
- **Level 0 (Canvas):** Pure deep charcoal `#141414`.
- **Level 1 (Structural Blocks / Columns):** `#202020` bounded by a 1px solid border of `#303030`.
- **Level 2 (Cards / Interactive Tiles):** `#262626` resting on `#202020`, distinguished either by a 1px contour or a flat 1-step tone increase.
- **Level 3 (Modals / Flyouts / Command Bars):** `#2F2F2F` with a distinct `#444444` outline.
- **Active Focus:** Outlined with a 1px crisp accent boundary in `#C85A32` or tinted semantic markers. Depth is communicated strictly by planar overlap and tonal variation.

## Shapes

In harmony with the brutalist lo-fi editorial identity, the primary structural roundedness token is set to `0` (Sharp):
- Workspace containers, modular layout boxes, gallery frames, inputs, and modal panes maintain strict 90-degree right angles with zero border radius.
- **Pill Exception for Categorical Markers:** Categorical tags, status labels, and view switchers (`Gallery`, `Board`, `Table`) use a pill radius format (`9999px`) to create an immediate visual separation between rigid architectural content frames and fluid, taxonomy-driven metadata.

## Components

### Buttons & Interactive Controls
- **Action Buttons:** Razor-sharp rectangular buttons featuring a 1px border (`#383838`) over a `#202020` background. On hover, the surface shifts to `#2A2A2A` with crisp white text.
- **'+ Add Section' Controller:** Full-width or inline low-contrast ghost button featuring dashed or solid hairline boundaries with a leading monospace `+` glyph. Hovering highlights the element with a terracotta border tint (`#C85A32`).

### Chips & Status Markers
- Rendered as soft-tinted, pill-shaped markers (border-radius: `9999px`) using `Courier Prime` at `10px` or `11px`.
- Composed of low-opacity backgrounds with high-contrast foreground glyphs:
  - Terracotta (e.g. Cancelled, Critical): `rgba(200, 90, 50, 0.18)` / `#E07A5F`
  - Slate Blue (e.g. Schedule, Coursework): `rgba(78, 121, 167, 0.2)` / `#8AB4F8`
  - Olive/Moss (e.g. Active, Sports): `rgba(89, 161, 79, 0.2)` / `#81C995`

### Cards & Gallery Blocks
- Rectangular 0px radius cards with a 16:9 or 4:3 fixed-aspect image window anchored to the top edge.
- Visual banner accents can host anime-style artwork or graphic covers with an uncurved, zero-radius bottom edge meeting a dark `#202020` card body.
- Content rows beneath display monospace file indicators (e.g. `📄 Title text`) with zero inner clutter.

### Kanban & Board Columns
- Vertical lanes framed in flat dark slate `#1A1A1A` with a compact header containing the pill label and card counters.
- Sub-cards within lanes have a 1px solid border (`#2D2D2D`), stacking vertically with `space-sm` gaps.

### Input Fields & Search Bars
- Monospaced input lines with sharp borders, dark `#181818` fills, and subtle blinking box or block cursors.
- Placeholders adopt `#686560` in typewriter styling. Focus triggers a rigid `#C85A32` hairline border without glow or ambient ring.