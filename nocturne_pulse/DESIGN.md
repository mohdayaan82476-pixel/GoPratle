---
name: Nocturne Pulse
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#e4beb3'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#ab897f'
  outline-variant: '#5b4038'
  surface-tint: '#ffb59e'
  primary: '#ffb59e'
  on-primary: '#5e1700'
  primary-container: '#ff5a1f'
  on-primary-container: '#541400'
  inverse-primary: '#ae3200'
  secondary: '#c2c6d8'
  on-secondary: '#2b303e'
  secondary-container: '#424655'
  on-secondary-container: '#b0b5c6'
  tertiary: '#ffb598'
  on-tertiary: '#591d00'
  tertiary-container: '#e07444'
  on-tertiary-container: '#501900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#dee2f4'
  secondary-fixed-dim: '#c2c6d8'
  on-secondary-fixed: '#161b28'
  on-secondary-fixed-variant: '#424655'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb598'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7e2c00'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  badge-micro:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-md: 3rem
  margin-lg: 5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
  space-3xl: 6rem
---

## Brand & Style

This design system expresses a forward-leaning, high-energy event marketplace aesthetic engineered for tech-savvy organizers, creators, and attendees. The look fuses cinematic dark-mode luxury with the operational sharpness of a next-generation SaaS platform. It communicates curation, discovery, and live-experience dynamism through high-contrast surfaces and radiant thermal accents.

Key stylistic pillars:
- **Atmospheric Depth:** Deep charcoal foundations that recede, allowing event imagery and primary cues to project forward.
- **Controlled Kinetic Energy:** Vivid kinetic orange highlights evoke nightfall, stage lighting, and digital ticketing warmth without overwhelming administrative or browsing functions.
- **Modern Tech Precision:** Refined glassmorphism layered over subtle micro-mesh gradients, grounded by structured geometry and airy typographic pacing.

## Colors

The palette relies on a deeply tiered dark environment punctuated by an incandescent orange accent system and balanced slate tones.

### Surface Hierarchy
- **Canvas / Root Background (`#0B0D11`):** Deep charcoal void for baseline viewport rendering.
- **Surface Elevation 1 (`#12161F`):** Structural backdrops, section alternations, and standard panels.
- **Surface Elevation 2 (`#1A1F2C`):** Interactive cards, dialog wrappers, and nested navigation rails.
- **Surface Translucent (`rgba(26, 31, 44, 0.65)`): Backdrop-filtered layers used for floating headers, tickets, and interactive popovers.

### Accents & Indicators
- **Primary Accent (`#FF5A1F`):** Core calls to action, active state markers, ticket price callouts, and primary badges.
- **Accent Hover / Glow (`#FF723F`):** Transient interaction states and ambient box-shadow light sources.
- **Secondary Glow / Tertiary (`#FF8C5A`):** Low-opacity radial bleeds and multi-stop gradient terminations.

### Content & Stroke Tones
- **Text High-Contrast (`#F8FAFC`):** Primary headings, critical data, active tab labels.
- **Text Body / Muted (`#94A3B8`):** Descriptions, supporting copy, sub-navigation.
- **Text Subtle / Metadata (`#64748B`):** Timestamps, form hints, micro-labels, deactivated states.
- **Border Subtle (`rgba(255, 255, 255, 0.08)`): Standard structural containment strokes.
- **Border Highlight (`rgba(255, 90, 31, 0.35)`): Selected cards, active input rings, highlighted event tiers.

## Typography

The typography leverages **Plus Jakarta Sans** across all hierarchies to synthesize technical precision with friendly, hyper-modern proportions. 

Rules for implementation:
- **Tight Kerning on Large Displays:** Apply negative tracking (`-0.02em` to `-0.03em`) on display and headline weights to ensure tight, modern punchiness reminiscent of premium editorial platforms.
- **Strict Hierarchy Separation:** Display headers leverage `FontWeight: 800` paired with pure white (`#F8FAFC`). Body sections use regular weights with `#94A3B8` to maximize readability without visual fatigue against pure dark canvases.
- **Micro Labels & Meta:** All badges, category tags, and date chips utilize uppercase styling (`text-transform: uppercase`) paired with letter spacing (`0.04em`–`0.08em`) to convey structural authority.

## Layout & Spacing

The layout is constructed on an adaptive 12-column grid prioritizing dynamic vertical spacing and asymmetric card showcases.

### Grid & Margins
- **Desktop (>= 1280px):** 12-column layout, max content container width of `1280px`, `gutter-lg` (`2rem`), with page margin margins starting at `margin-lg` (`5rem`).
- **Tablet (768px – 1279px):** 8-column fluid layout, `gutter` (`1.5rem`), with outer canvas padding set to `margin-md` (`3rem`).
- **Mobile (< 768px):** 4-column fluid layout, `gutter-sm` (`1rem`), with minimum gutter padding of `margin` (`1.5rem`).

### Rhythm & Pacing
- Structural landing page sections utilize generous breathing space (`space-2xl` on mobile, `space-3xl` on desktop) to evoke exclusivity.
- Dense marketplace card arrays use `space-md` gaps internally and `space-lg` margins externally to preserve distinct hit targets and readable data clusters.

## Elevation & Depth

Visual hierarchy uses frosted luminescence, stacked dark surface containers, and low-opacity chromatic glows rather than traditional murky drop shadows.

### Glassmorphic Mechanics
- **Backdrop Blur:** All elevated panels utilize a blur radius of `16px` to `24px` with a saturating boost (`saturate(180%)`).
- **Translucent Fill:** Default elevated container uses `rgba(26, 31, 44, 0.65)` layered over the background `#0B0D11`.
- **Surface Stroke:** Encapsulate all glass panels with a crisp `1px` border using `rgba(255, 255, 255, 0.08)`. In hover or active states, the border transforms to `rgba(255, 255, 255, 0.18)` or `rgba(255, 90, 31, 0.4)`.

### Ambient Glows
- **Accent Glow (Action Points):** Primary buttons and featured event cards emit a diffused glow via `box-shadow: 0 12px 32px -8px rgba(255, 90, 31, 0.35)`.
- **Atmospheric Canvas Glow:** Position non-interactive radial gradients (`radial-gradient(circle, rgba(255, 90, 31, 0.12) 0%, rgba(11, 13, 17, 0) 70%)`) in section corners and behind hero modules to create organic spatial depth.
- **Card Hover Elevation:** On user hover, translate cards by `translateY(-4px)` with a smooth transition (`200ms cubic-bezier(0.16, 1, 0.3, 1)`), increasing the perimeter border luminescence.

## Shapes

The geometric identity relies on softened rectangular forms that balance organic flow with architectural discipline.

### Token Application
- **Standard Cards & Modules:** Bound to `16px` (`rounded-2xl` equivalent) for event listing cards, search control bays, and modal dialogs.
- **Interactive Controls:** Form fields, filter buttons, and secondary action wrappers use `12px` (`rounded-xl` equivalent).
- **Floating Badges, Avatars & Tags:** Full rounded curves (`9999px` / pill shape) for status chips, live indicators, category pills, and social proof counters.

## Components

### Buttons
- **Primary:** Background `#FF5A1F`, text `#F8FAFC`, font weight 600. Includes subtle inner top bevel (`inset 0 1px 0 rgba(255,255,255,0.2)`) and ambient glow `0 8px 24px -4px rgba(255,90,31,0.4)`. Hover state brightens background to `#FF723F`.
- **Secondary / Glass:** Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`. Hover state background shifts to `rgba(255, 255, 255, 0.1)`.
- **Tertiary / Ghost:** No background or border. Text `#94A3B8`, transitioning to `#F8FAFC` on hover with a micro underline accent.

### Cards (Event & Marketplace)
- **Structure:** Background `rgba(26, 31, 44, 0.65)`, backdrop-filter `blur(16px)`, border `1px solid rgba(255, 255, 255, 0.08)`, border radius `16px`, overflow hidden.
- **Media Frame:** Top media section with `16:9` or `4:3` ratio, subtle bottom gradient overlay (`linear-gradient(to top, #1A1F2C, transparent)`).
- **Content Area:** Padding `1.5rem`. Price tags rendered in `#FF5A1F` with bold tracking. Meta details (date, venue) paired with muted slate icons (`#64748B`).

### Badges & Category Chips
- **Live / Trending Badge:** Pill shape, background `rgba(255, 90, 31, 0.15)`, text `#FF5A1F`, border `1px solid rgba(255, 90, 31, 0.3)`. Features a pulsing `6px` orange indicator dot.
- **Category Filter Chips:** Pill shape, padding `0.5rem 1rem`. Inactive: background `rgba(255,255,255,0.03)`, text `#94A3B8`. Active: background `#F8FAFC`, text `#0B0D11`, font weight 700.

### Input Fields & Search Bars
- **Container:** Background `rgba(18, 22, 31, 0.8)`, border `1px solid rgba(255, 255, 255, 0.08)`, border radius `12px`, padding `0.75rem 1rem`.
- **Typography:** Value text `#F8FAFC`, placeholder text `#64748B`.
- **States:** Focus produces a `1px solid #FF5A1F` perimeter and a faint exterior glow `0 0 0 3px rgba(255, 90, 31, 0.15)`.

### Selection Controls (Checkboxes & Radios)
- **Checkbox:** Square with `4px` corner rounding. Unchecked: `1px solid rgba(255,255,255,0.2)`, background `transparent`. Checked: background `#FF5A1F`, border `#FF5A1F`, displaying a sharp white checkmark glyph.
- **Radio:** Circular, identical base treatment. Checked reveals a centered `6px` solid white circle over the `#FF5A1F` base.

### Specialized Marketplace Modules
- **Interactive Ticket Tier Selector:** Row-based glass units with dynamic left-border orange indicators upon selection, featuring seat counts and live inventory counters.
- **Organizer Trust Card:** Compact glass surface housing a verified badge, organizer rating metric, and integrated follow toggle.