---
name: Recall Productivity
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#464554'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#303b4e'
  on-tertiary: '#ffffff'
  tertiary-container: '#475266'
  on-tertiary-container: '#bac5dd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1200px
---

## Brand & Style

The design system is centered on the concept of "Cognitive Clarity." It targets high-performance individuals who require a tool that feels like a native extension of their thought process. The aesthetic is **Corporate Modern** with a lean toward **Minimalism**, stripping away non-functional decoration to prioritize information density and speed of task completion.

The UI must evoke a sense of professional reliability and calm through structured layouts, a restricted color palette, and high-quality typography. Every element serves a functional purpose, ensuring the tool feels fast, predictable, and trustworthy.

## Colors

This design system utilizes a sophisticated palette of Indigo and Slate to establish authority and focus.

- **Primary (Indigo 700):** Used for primary actions, active navigation states, and the "Interviewing" status.
- **Secondary (Slate 600):** Used for secondary actions, metadata, and the "Applied" status.
- **Neutral (Slate 50):** The primary background color to reduce eye strain compared to pure white.
- **Surface:** Pure white (#FFFFFF) is reserved for cards and input fields to create a clear "layer" above the neutral background.
- **Status Colors:** These are applied with high-saturation for clear categorization but should be used sparingly (e.g., small pips or subtle badge backgrounds) to maintain the professional tone.

## Typography

The system uses **Inter** for all primary UI roles to ensure maximum legibility across different resolutions. A strong emphasis is placed on weight contrast to allow users to scan data-heavy screens quickly.

- **Headlines:** Use tighter letter spacing and heavy weights (600-700) to create clear anchors for the eye.
- **Body:** Standardized at 16px for comfortable reading, with a 14px variant for secondary details or denser list views.
- **Labels:** Small caps or uppercase labels are used for metadata headers to distinguish them from actionable content.
- **Monospaced:** Optional use of a mono font for IDs or date-stamps to reinforce the utilitarian, precise nature of the tool.

## Layout & Spacing

This design system follows a strict **4px/8px grid system**. All layout dimensions, padding, and margins must be multiples of 4.

- **Mobile:** 4-column fluid grid. Margins are 16px. Vertical rhythm is tight to keep content "above the fold."
- **Desktop:** 12-column grid with a fixed maximum width of 1200px. Content is centered with generous 48px side margins to prevent wide line lengths that hinder readability.
- **Containers:** Use 16px (md) for internal padding of cards to balance density with breathability.

## Elevation & Depth

To maintain a "Native PWA" feel, depth is created through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Level 0 (Base):** Background color (Slate 50).
- **Level 1 (Cards/Surface):** White background with a 1px border (#E2E8F0).
- **Level 2 (Hover/Active):** A very soft, diffused shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.05)) is applied only to interactive cards or open menus.
- **Separators:** Use a 1px solid line (#F1F5F9) for horizontal rules within cards or lists to maintain structure without adding visual noise.

## Shapes

The shape language is **Soft**, utilizing small radii to maintain a professional, organized appearance while avoiding the "toy-like" feel of fully rounded corners.

- **Standard Elements:** Buttons, inputs, and small cards use a 4px (0.25rem) radius.
- **Large Containers:** Dashboard widgets or main content areas use an 8px (0.5rem) radius.
- **Badges/Chips:** Use a full "Pill" radius (999px) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid Indigo background, White text. High-contrast and easily identifiable.
- **Secondary:** White background with a Slate 200 border.
- **Tap Targets:** Minimum height of 48px for all buttons on mobile to ensure ease of use.

### Cards (Application Data)
- Cards are the primary container for productivity items. They feature a 1px border and a subtle status pip in the top right corner.
- **Micro-interaction:** On hover, cards lift slightly with a shadow and the border color shifts to the Primary Indigo.

### Input Fields
- Inputs use a 1px border and a subtle inner shadow to feel "inset."
- Active state: The border transitions to Indigo with a 2px outer glow (ring) of 10% Indigo.

### Status Chips
- Small, rounded-pill indicators.
- Format: A colored dot (pip) next to text in Slate 700. Avoid filling the entire chip with bright color to keep the UI calm.

### Lists
- Lists use "zebra-striping" or subtle bottom-borders only.
- Items have a minimum vertical padding of 12px to maintain a breathable but compact vertical rhythm.
