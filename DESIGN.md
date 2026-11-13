# Design direction

Book Reviews is a text-first reading ledger presented as a film-cutting bench.
The selected review is the current workprint; the contact sheet keeps adjacent
entries reachable without collapsing the archive into a card grid.

- Palette: true black, grain orange, punched white, warm paper text.
- Type: Cormorant Garamond for the literary voice, Roboto Condensed for UI,
  and DM Mono for frame labels and metadata.
- Form: perforated rails, frame marks, workprint strip, and text-only cover
  windows because the referenced cover assets are not present.
- Content truth: ratings, dates, ISBNs, authors, and review copy come from the
  MDX files. The interface does not imply attached cover artwork.
- Responsive rule: the rail becomes a vertical contact sheet on narrow screens;
  the selected frame remains the first reading target.


---

## Storybook

Storybook 10 (`@storybook/nextjs-vite`) shows this design system with the app's real CSS, tokens and fonts.

```bash
npm run storybook        # http://localhost:6006
npm run build-storybook  # static build in storybook-static/ (CI: .github/workflows/storybook.yml)
```

- **Foundations/Tokens** reads every CSS custom property the app defines at runtime, so it never drifts from the code.
- **Design/DESIGN.md** renders this file.
- **Components/**, **Sections/** and **Pages/** show the UI with mock data only (no network, analytics off).
- Toolbar: locale, theme (light / dark, when the app has a dark theme), viewports 320 / 375 / 768 / 1440. The a11y panel runs axe (WCAG 2.2 AA).
- Rule: a new shared component or page section ships with a story in `stories/`.
