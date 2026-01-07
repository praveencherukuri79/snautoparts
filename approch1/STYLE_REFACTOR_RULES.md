# CSS REFACTORING RULES (Cursor IDE) — MULTI-THEME ENABLED

## Goal
Refactor CSS to:
- Make the app visually consistent
- Centralize styles into global files
- Use variables and reusable CSS
- Reduce component-level styles
- Support multiple themes (e.g., light/dark, brand themes)
- Preserve existing UI behavior exactly

---

## 1) Absolute rules (do not break these)
- DO NOT change visual appearance (within the current theme)
- DO NOT change layout structure
- DO NOT introduce new arbitrary colors/spacing/fonts/sizes (use tokens only)
- DO NOT add inline styles
- DO NOT add framework hacks or deprecated selectors
- Prefer simplicity over clever solutions

---

## 2) Global-first styling strategy
Always follow this priority order:
1. Global styles
2. CSS variables (design tokens)
3. Reusable utility / pattern classes
4. Component-level styles (last resort only)

Never duplicate the same styles across components.

---

## 3) Multi-theme architecture (mandatory)
### Token model
- ALL visual values must be expressed via CSS variables (tokens)
- Component and reusable CSS must reference ONLY tokens (never hardcoded colors)

### Theme switching mechanism
- Theme is applied by a root attribute/class on the document root:
  - Preferred: `html[data-theme="light"]`, `html[data-theme="dark"]`, `html[data-theme="brandA"]`
  - Acceptable: `body.theme-light`, `body.theme-dark`

### Required global files (conceptual)
- `styles/tokens.css`       → token names + defaults (optional)
- `styles/theme.light.css`  → values for light theme
- `styles/theme.dark.css`   → values for dark theme
- `styles/theme.brandX.css` → values for additional themes
- `styles/components.css`   → reusable pattern classes using tokens
- `styles/globals.css`      → resets, typography base, global layout helpers

Do not implement multiple competing systems. Pick one and standardize.

---

## 4) Token naming rules (semantic only)
Tokens must be semantic, not visual.

GOOD:
--color-bg
--color-surface
--color-text
--color-text-muted
--color-border
--color-primary
--color-primary-contrast
--color-danger
--shadow-sm
--radius-md
--spacing-sm
--spacing-md
--font-body
--font-heading

BAD:
--blue-500
--gray-200
--padding-12
--radius-6

---

## 5) Hard rules for component CSS (minimize aggressively)
Component CSS should contain ONLY:
- Component-specific layout glue
- Truly unique behavior that cannot be reused

Move OUT of component styles:
- Colors (must come from tokens)
- Typography (must come from tokens/base styles)
- Spacing rules (use spacing tokens or reusable classes)
- Common flex/grid patterns (use reusable classes)
- Shared hover/focus/active states (use reusable classes)

Target outcome:
- Smaller component CSS files
- Most styling defined globally and theme-aware

---

## 6) Reusable CSS patterns (preferred)
Extract repeated patterns into reusable classes such as:
- buttons
- cards
- sections
- headers
- form rows
- containers
- badges
- alerts

Reusable classes MUST:
- use tokens only
- be theme-safe by design

Example:
.card {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

---

## 7) Selector and naming rules
- Use flat, predictable selectors
- Avoid deep or DOM-dependent selectors
- Avoid styling by element nesting
- Prefer class-based styling

GOOD:
.button-primary
.card-header
.form-row

BAD:
div > mat-card > .content > span

---

## 8) What Cursor SHOULD do
- Remove duplicate CSS rules
- Merge identical selectors
- Normalize spacing and typography through tokens
- Replace magic numbers with variables
- Move shared styles to global scope
- Ensure every visual value is token-driven (theme-safe)
- Reduce total CSS size and repetition

---

## 9) What Cursor MUST NOT do
- Guess new design values
- Hardcode colors in component CSS
- Introduce arbitrary Tailwind-like values if not already standardized
- Change breakpoints
- Add animations or transitions
- Change component behavior
- Introduce new dependencies

---

## 10) Theme safety checklist (required)
After refactor:
- Switching `data-theme` changes only token values, not component CSS
- No hardcoded colors remain in component styles
- All reusable classes reference tokens only
- UI looks identical under the default theme
- Alternate themes render correctly without per-component overrides

---

## Final rule
Consistency beats cleverness.
Centralization beats customization.
Theme tokens are the source of truth.
Optimize for maintainability, not creativity.
