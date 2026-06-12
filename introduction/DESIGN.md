---
name: Monolith Aesthetic
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c5c7c9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8f9194'
  outline-variant: '#44474a'
  surface-tint: '#c6c6c8'
  primary: '#ffffff'
  on-primary: '#2f3132'
  primary-container: '#e2e2e4'
  on-primary-container: '#636466'
  inverse-primary: '#5d5e60'
  secondary: '#c6c6c6'
  on-secondary: '#303030'
  secondary-container: '#474747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#2f3034'
  tertiary-container: '#e3e2e7'
  on-tertiary-container: '#646469'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e4'
  primary-fixed-dim: '#c6c6c8'
  on-primary-fixed: '#1a1c1d'
  on-primary-fixed-variant: '#454749'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e3e2e7'
  tertiary-fixed-dim: '#c7c6cb'
  on-tertiary-fixed: '#1a1b1f'
  on-tertiary-fixed-variant: '#46464b'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  mono-technical:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  section-gap: 160px
---

## Brand & Style

This design system is built for the intersection of precision engineering and high-end lifestyle. It targets enthusiasts who view mechanical keyboards not just as tools, but as bespoke pieces of industrial art. The brand personality is quiet, confident, and authoritative, favoring "less but better."

The visual style is **Minimalist with Glassmorphic accents**. It draws heavily from modern industrial design, utilizing vast expanses of negative space to frame high-fidelity product photography. The emotional response should be one of "calm technicality"—evoking the tactile click of a well-machined switch and the premium weight of an aluminum chassis.

## Colors

The palette is strictly monochromatic with a singular functional accent. 
- **Primary (#F5F5F7):** Used for typography on dark backgrounds and high-signal elements.
- **Secondary (#000000):** The foundation. Deep blacks create an infinite canvas for product shots.
- **Tertiary (#86868B):** Used for secondary metadata and disabled states to maintain low visual noise.
- **Accent (#007AFF):** A precise, high-chroma blue used sparingly for interactive states (links, active toggles).

The default state is **Dark Mode**. Light mode should only be used for physical documentation or high-contrast editorial spreads. Use `#1D1D1F` for elevated surfaces to maintain depth against the pure black background.

## Typography

The typographic hierarchy prioritizes legibility and a "technical-luxe" feel.
- **Headlines:** Use **Hanken Grotesk** for its sharp, contemporary geometry. Tighten tracking on large displays to create a solid, impactful block of text.
- **Body:** **Inter** provides a neutral, utilitarian balance that ensures long-form specifications are easy to digest.
- **Technical Labels:** **Geist** is used for monospaced data points (e.g., actuation force, weight, polling rate), reinforcing the developer-centric and engineering-heavy nature of the product.

Generous letter spacing is applied specifically to `label-caps` to evoke the high-end feel of luxury watch branding.

## Layout & Spacing

This design system uses a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile. 
- **Desktop:** A 12-column grid with a 1440px max-width. Sections are separated by "massive whitespace" (160px gaps) to force focus on one component or feature at a time.
- **Mobile:** A 4-column grid with 24px side margins. 

The spacing rhythm is strictly based on an 8px base unit. Margin and padding should always be multiples of 8. Elements should feel "airy"—never crowd a product image with text. If a component feels cramped, double the padding.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism**, rather than traditional heavy shadows.
- **Level 0 (Background):** Pure `#000000`.
- **Level 1 (Cards/Containers):** `#1D1D1F` with a subtle 1px border of `#F5F5F7` at 10% opacity.
- **Level 2 (Overlays/Modals):** Glassmorphism. Use a background blur of 20px-40px with a white fill at 5-10% opacity. This simulates the frosted look of polycarbonate keyboard cases.
- **Shadows:** Only used to separate Level 2 elements from Level 1. Use a highly diffused, 0% offset shadow: `0 20px 40px rgba(0,0,0,0.5)`.

## Shapes

The shape language reflects the "squircle" geometry found in premium industrial design. 
- **Standard UI elements** (Inputs, Buttons) use a **0.5rem (8px)** radius.
- **Feature Cards and Images** use a much more aggressive **1.5rem (24px)** radius (`rounded-xl`) to mimic the rounded corners of a keyboard chassis.
- Buttons should never be fully pill-shaped; they must maintain a structured, rectangular essence with soft corners to feel like physical keycaps.

## Components

- **Buttons:** Primary buttons are Solid `#F5F5F7` with `#000000` text. Secondary buttons are "Ghost" style: 1px border of `#86868B` with no fill.
- **Chips:** Small, technical indicators using `label-caps` typography. They use a dark gray background (`#2C2C2E`) to stay unobtrusive.
- **Inputs:** Dark fields with a 1px bottom border only. On focus, the border transitions to the Accent Blue. Use `mono-technical` for input text.
- **Cards:** Utilize the glassmorphism rules from Section 5. Cards should have generous internal padding (min 40px) and use high-resolution, low-key lighting imagery.
- **Interactive States:** Use "Spring" physics for all hover interactions. A slight scale-up (1.02x) on cards and buttons provides a tactile, physical response.
- **Spec List:** A vertical list where the label is `label-caps` in `#86868B` and the value is `body-lg` in `#F5F5F7`.