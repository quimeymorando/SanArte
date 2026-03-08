# Sacred Noir Design Blueprint

**Date:** 2026-03-08
**Product:** SanArte
**Direction approved:** Mistica premium (Sacred Noir)

## Goal

Convert SanArte into a premium, emotionally magnetic experience where every screen feels collectible, cinematic, and deeply intentional. The app should move from "functional wellness UI" to "ritual-grade digital product" while preserving speed, clarity, and trust.

## Experience Pillars

1. **Luxury intimacy:** dark obsidian atmosphere, warm ivory readability, controlled gold/cyan accents.
2. **Emotional hierarchy:** every screen opens with a "wow" moment, then transitions into actionable flow.
3. **Coherent ritual language:** typography, spacing, motion, and copy behave as one system.
4. **Trust before novelty:** legal, privacy, account, and payment surfaces remain clear and explicit.

## Visual Architecture

- **Layer 1 - Atmosphere:** shared living background (deep gradients, subtle light halos, near-invisible texture).
- **Layer 2 - Surfaces:** premium glass-dark cards with thin borders and depth-based shadows.
- **Layer 3 - Focus:** clear typographic rhythm and one dominant action per viewport.
- **Layer 4 - Signature accents:** restrained luminous details reserved for key touchpoints.

## Core Screen Strategy

- **Landing:** ceremonial entry, strong first impression, sensual but confident auth prompt.
- **Home/Bento:** "personal altar" layout with greeting, ritual search, breathing centerpiece, and elegant navigation.
- **Search/Detail:** oracle-style reading flow, narrative clarity, premium content blocks.
- **Community/Profile/Upgrade:** same visual grammar, with Upgrade as aspirational membership narrative (not pushy sales).

## Interaction System

- Cinematic staggered reveals (background -> hero -> actions).
- Micro-interactions with tactile magnetism (press depth, controlled glow confirmations).
- Slow ambient motion in high-value components only.
- Polished emotional states: loading, empty, fallback, and error must feel branded and calm.
- `prefers-reduced-motion` respected in all animated surfaces.

## Experience Data Flow

- Journey backbone: `Landing -> Auth -> Home -> Search -> Detail -> Action -> Return with progress`.
- User context (recent intent, streak, progression cues) travels across screens to avoid fragmentation.
- Failures in AI/network degrade gracefully to useful fallback content with clear recovery actions.

## Error Handling and Safety UX

- Error language stays human, warm, and actionable.
- Sensitive flows (account, privacy, premium) require explicit confirmations and unmistakable feedback.
- No dead-end states: every failure state includes a next safe action.

## Validation Criteria

- Visual consistency across core routes.
- Mobile-first fluidity and tap ergonomics.
- Accessibility baseline: contrast, focus visibility, readable hierarchy.
- Performance discipline: animation cost bound to transform/opacity; monitor LCP/INP trend.
- Behavioral metrics: session length, D1/D7 return, search->detail conversion, detail->action conversion.

## Delivery Scope (Design Phase)

1. Establish global Sacred Noir tokens (color, type, spacing, elevation, motion).
2. Redesign core journey screens (Landing, Home/Bento, Search, Detail, Upgrade).
3. Harmonize reusable components and state patterns.
4. Run QA pass for accessibility/performance and refine.
