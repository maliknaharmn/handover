# Handover Design System

**Product:** Handover - Organizational Knowledge & Leadership Transition System
**Status:** Design System v1
**Primary stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Vercel
**Design direction:** Stripe-inspired visual language, adapted for an organizational handover product

---

## 1. Design Intent

Handover should feel trustworthy, structured, lightweight, and operationally clear.

The product borrows visual principles from Stripe's design language, especially its use of indigo, deep navy ink, light surfaces, restrained borders, pill-shaped actions, airy typography, and atmospheric gradient mesh on marketing surfaces. The goal is not to recreate Stripe, but to translate the same sense of polish and clarity into a product for organizational transition and institutional knowledge.

Handover has two distinct UI modes:

1. **Marketing surface** - expressive, editorial, atmospheric, and brand-led.
2. **Authenticated product surface** - utilitarian, task-oriented, high-clarity, and optimized for repeated operational use.

The product UI should always prioritize comprehension over decoration.

---

## 2. Brand Personality

Handover should communicate:

- **Continuity** - knowledge survives leadership changes.
- **Trust** - users can understand who transferred, reviewed, and verified an item.
- **Structure** - complex transitions become manageable workflows.
- **Calmness** - dense organizational tasks should not feel chaotic.
- **Accountability** - actions and ownership are visible without feeling punitive.
- **Modern professionalism** - suitable for student organizations, communities, and eventually larger institutions.

Avoid a startup aesthetic that feels playful for its own sake. Handover is not a social app, chat app, or gamified productivity product.

---

## 3. Core Design Principles

### 3.1 Clarity before decoration

Every visual decision should help users understand one of these questions:

- What needs to be handed over?
- Who owns this item?
- What is its current status?
- What action is expected from me?
- What changed?
- Is the transition complete?

If a visual element does not help answer one of those questions, it should be treated as optional.

### 3.2 Brand expression belongs mostly outside the work area

Gradient mesh, atmospheric color, large display type, and expressive compositions belong primarily to:

- landing page,
- sign-in / onboarding introduction,
- public product pages,
- launch or marketing material.

Inside the authenticated app, use brand tokens more quietly:

- indigo for primary actions and focus,
- deep navy for text and key surfaces,
- soft neutrals for layout,
- subtle status colors only when semantically necessary.

### 3.3 One action hierarchy

Each screen should have one obvious primary action. Secondary actions should visually step back.

Examples:

- `Create handover` is primary, `Import template` is secondary.
- `Submit for review` is primary, `Save draft` is secondary.
- `Verify item` is primary when the incoming officer is reviewing.

Do not create multiple filled indigo actions with equal visual weight in the same local section.

### 3.4 Status must be understandable without color alone

Every workflow state must include text. Color can reinforce meaning but may never be the only indicator.

### 3.5 Mobile is first-class

Many organization administrators will open Handover from a phone. Core flows must remain fully usable on mobile:

- review item,
- verify / request revision,
- add notes,
- open references,
- inspect progress,
- check outstanding work.

---

## 4. Color System

### 4.1 Core brand tokens

| Token | Value | Usage |
|---|---:|---|
| `--brand-primary` | `#533afd` | Primary CTA, active state, links, focus ring |
| `--brand-primary-deep` | `#4434d4` | Hover / stronger emphasis |
| `--brand-primary-press` | `#2e2b8c` | Pressed state |
| `--brand-primary-soft` | `#665efd` | Charts, subtle accents |
| `--brand-primary-subtle` | `#b9b9f9` | Soft tag fill or selected background |
| `--brand-dark` | `#1c1e54` | Dark branded surface |
| `--ink` | `#0d253d` | Primary text |
| `--ink-secondary` | `#273951` | Secondary text |
| `--ink-muted` | `#64748d` | Helper text, labels |
| `--surface` | `#ffffff` | Default surface |
| `--surface-soft` | `#f6f9fc` | App background, soft sections |
| `--surface-cream` | `#f5e9d4` | Marketing-only warm interlude |
| `--border` | `#e3e8ee` | Default border |
| `--border-input` | `#a8c3de` | Form border |

### 4.2 Semantic status tokens

Product status colors must be restrained and accessible. They should not overpower the brand primary.

Recommended semantic mapping:

| Status | Visual treatment |
|---|---|
| `not_started` | neutral gray text + subtle neutral background |
| `in_progress` | cool blue text + very light blue background |
| `ready_for_review` | indigo text + pale indigo background |
| `revision_required` | amber / warm-orange text + pale amber background |
| `verified` | green text + pale green background |

Exact semantic hex values may be tuned during implementation to meet WCAG contrast requirements.

Do not reuse brand indigo for every status.

### 4.3 Marketing gradient mesh

Marketing heroes may use a wide atmospheric mesh built from:

- cream,
- warm orange,
- lavender,
- indigo,
- ruby / magenta.

The mesh should feel organic and diffused, not like a generic diagonal CSS gradient.

Use it sparingly. It is a signature brand surface, not a background for dashboard pages.

---

## 5. Typography

### 5.1 Font strategy

Do not depend on proprietary Söhne.

Use:

1. **Geist** as the preferred production font for Next.js.
2. **Inter** as an acceptable fallback.
3. `system-ui`, `-apple-system`, `sans-serif` as final fallback.

Recommended Next.js setup:

- load with `next/font`,
- prefer variable font,
- use light / regular display weights,
- keep body weights readable rather than excessively thin.

### 5.2 Typographic character

Marketing surfaces may use lighter display weight and tighter tracking.

Authenticated app surfaces should prioritize legibility and scanning speed.

### 5.3 Suggested scale

| Role | Desktop | Weight | Tracking | Usage |
|---|---:|---:|---:|---|
| Display XL | 56px | 300-400 | -0.03em | Marketing hero |
| Display LG | 48px | 300-400 | -0.025em | Marketing section opener |
| Display MD | 32px | 400 | -0.02em | Product page title / large metric |
| Heading LG | 24px | 500 | -0.015em | Screen title |
| Heading MD | 20px | 500 | -0.01em | Section title |
| Heading SM | 16px | 500 | 0 | Card / panel title |
| Body LG | 16px | 400 | 0 | Lead text |
| Body MD | 14-15px | 400 | 0 | Default product UI |
| Label | 13px | 500 | 0 | Field and table labels |
| Caption | 12px | 400 | 0 | Helper text / metadata |

### 5.4 Numeric typography

Use tabular figures for:

- progress percentages,
- item counts,
- dates where alignment matters,
- metrics,
- checklist totals.

CSS:

```css
font-variant-numeric: tabular-nums;
```

---

## 6. Spacing System

Use an 8px base rhythm with smaller sub-tokens where needed.

| Token | Value |
|---|---:|
| `2xs` | 2px |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 24px |
| `2xl` | 32px |
| `3xl` | 48px |
| `4xl` | 64px |

Guidelines:

- Dense app rows: 8-12px vertical padding.
- Forms: 16-24px spacing between logical groups.
- Dashboard panels: 24px internal padding desktop, 16px mobile.
- Marketing sections: 64-96px vertical spacing.

---

## 7. Shape System

Use one consistent geometry system.

| Token | Value | Usage |
|---|---:|---|
| `radius-xs` | 4px | Dense chips / compact table UI |
| `radius-sm` | 6px | Inputs |
| `radius-md` | 8px | Dropdowns, alerts |
| `radius-lg` | 12px | Cards / panels |
| `radius-xl` | 16px | Large branded visual panel |
| `radius-pill` | 9999px | Buttons, status pills |

Rule:

- Buttons are pill-shaped.
- Inputs are 6-8px.
- Product cards / panels are 10-12px.
- Do not randomly mix very round cards with square tables.

---

## 8. Elevation

Use shadows sparingly.

### Level 0

Flat surface. Default for most authenticated app layouts.

### Level 1

```css
box-shadow: 0 1px 3px rgba(0, 55, 112, 0.08);
```

Use for:

- floating filter panel,
- compact card that needs mild separation.

### Level 2

```css
box-shadow:
  0 8px 24px rgba(0, 55, 112, 0.08),
  0 2px 6px rgba(0, 55, 112, 0.04);
```

Use for:

- modal,
- command/search palette,
- marketing product screenshot frame.

Do not use deep black shadows.

---

## 9. Iconography

Use one icon family consistently.

Preferred:

- Phosphor Icons, or
- Radix Icons if already introduced through component dependencies.

Rules:

- default stroke / weight should feel light and precise,
- icons supplement text, not replace important labels,
- do not hand-draw SVG paths,
- avoid decorative icons inside every row.

---

## 10. Marketing Surface Rules

Marketing pages can be more expressive than the product UI.

### Hero

Recommended pattern:

- asymmetric or strongly left-aligned composition,
- clear headline,
- subtext under 20 words where possible,
- one primary CTA,
- one optional secondary CTA,
- gradient mesh as atmospheric backdrop,
- real product screenshot or real component preview.

Avoid generic centered SaaS hero patterns unless there is a strong reason.

### Marketing CTA

Primary:

- filled indigo,
- white text,
- pill shape,
- minimum 40px height desktop,
- 44px mobile.

Secondary:

- white / transparent,
- indigo text,
- clear border.

### Product visuals

Prefer:

- real screenshots of Handover,
- actual mini product components,
- generated promotional compositions based on real UI.

Do not create fake dashboard screenshots made from meaningless div rectangles.

---

## 11. Authenticated App Surface Rules

The app surface should feel calmer and more operational than the landing page.

### App background

Default:

- page: `--surface-soft`,
- panels: white,
- text: `--ink`,
- borders: `--border`.

### Primary layout

Desktop:

```text
┌──────────────┬─────────────────────────────────────┐
│ Sidebar      │ Top bar / context                   │
│              ├─────────────────────────────────────┤
│ Overview     │ Page content                        │
│ Handovers    │                                     │
│ Knowledge    │                                     │
│ Activity     │                                     │
│ Settings     │                                     │
└──────────────┴─────────────────────────────────────┘
```

Tablet:

- collapsible sidebar,
- preserve page header and action hierarchy.

Mobile:

- sidebar becomes drawer or compact navigation,
- main content becomes strict single-column,
- persistent page actions may move to sticky bottom action area only when necessary.

---

## 12. Navigation

### Sidebar

Use for authenticated app navigation.

Characteristics:

- white or soft neutral surface,
- compact spacing,
- active item uses subtle indigo background and indigo text,
- no decorative colored dot on every item,
- section grouping only when it improves scanning.

Suggested top-level items:

- Overview
- Handovers
- Knowledge
- Activity
- Members
- Settings

Final labels should follow product IA in the PRD.

### Top bar

Contains context rather than duplicate navigation.

Examples:

- current organization,
- active period,
- search,
- notifications,
- user menu.

---

## 13. Buttons

### Primary button

```text
Background: #533afd
Text: white
Radius: pill
Height: 40px minimum
Padding: 8px 16px
```

Hover: `#4434d4`
Pressed: `#2e2b8c`

### Secondary button

- white or transparent,
- indigo or ink text,
- visible 1px border.

### Ghost button

Use for low-priority contextual actions only.

### Destructive action

Use a separate semantic destructive treatment. Do not use brand indigo.

### Action consistency

Use the same verb for the same action everywhere.

Examples:

- `Verify`, not a mixture of `Accept`, `Approve`, and `Verify` for the same state transition.
- `Request revision`, not alternating with `Reject` unless the product meaning is actually different.

---

## 14. Forms

Handover is form-heavy. Forms must feel calm and predictable.

### Field anatomy

```text
Label
[ Input                         ]
Helper text or validation message
```

Rules:

- label always above field,
- placeholder is never a label,
- helper text may be optional,
- validation error appears directly under the field,
- focus ring uses brand indigo,
- target height at least 40px, preferably 44px on mobile.

### Multi-section forms

Use grouped sections rather than one giant card.

Examples:

- Basic information
- Reference / document
- Transfer notes
- Owner and reviewer

Avoid making every field its own card.

---

## 15. Handover Item UI

A handover item is one of the core product objects.

It should always expose:

- title,
- category,
- current status,
- outgoing owner,
- incoming reviewer,
- required / optional state,
- last updated time,
- key action.

Recommended item row hierarchy:

```text
Item title                         [Ready for review]
Category / owner / last updated
Short note or reference count
                                           Review →
```

Avoid turning each row into a large decorated card unless there is meaningful detail to display.

---

## 16. Status Workflow UI

Canonical states:

```text
not_started
    ↓
in_progress
    ↓
ready_for_review
    ├── verified
    └── revision_required
            ↓
        in_progress
```

Display labels:

| Internal value | UI label |
|---|---|
| `not_started` | Not started |
| `in_progress` | In progress |
| `ready_for_review` | Ready for review |
| `revision_required` | Revision required |
| `verified` | Verified |

The status component must include readable text and may use icon + color as reinforcement.

---

## 17. Verification UI

Verification is a meaningful action and should feel explicit.

Incoming Officer review screen should clearly separate:

- content being reviewed,
- references / document links,
- outgoing notes,
- comments,
- decision actions.

Decision area:

- primary: `Verify item`
- secondary / warning: `Request revision`

A revision request should require a note explaining what must change.

Do not allow destructive-looking styling for normal revision workflow. Revision is expected collaboration, not failure.

---

## 18. Comments and Revision UI

Comments should feel contextual, not like a chat application.

Recommended pattern:

```text
Malik
18 Sep, 20:12
Latest SOP has been linked. Recruitment timeline was also updated.

Ahmad
18 Sep, 20:26
Please replace the 2025 template with the 2026 version before review.
```

Rules:

- show author,
- timestamp,
- role if relevant,
- clear chronology,
- revision comments may receive a subtle amber context marker.

Do not add chat bubbles unless a future messaging feature is deliberately introduced.

---

## 19. Activity Log UI

Activity log is an audit trail, not a social feed.

Recommended structure:

```text
18 Sep 20:12
Malik submitted "Instagram Account" for review

18 Sep 20:15
Ahmad verified "Instagram Account"
```

Use:

- timestamp,
- actor,
- action,
- target object,
- optional metadata.

Prefer a clean chronological list with sparse dividers.

Do not put every activity inside a card.

---

## 20. Dashboard and Metrics

Dashboard should answer:

1. How complete is the handover?
2. What is waiting for me?
3. What is blocked?
4. Which division or category needs attention?

### Primary metrics

Examples:

- Overall completion
- Verified items
- Waiting review
- Revision required
- Outstanding tasks

### Progress presentation

Use progress bars only when progress is truly meaningful.

Overall handover completion is an appropriate use.

Avoid placing a progress bar on every metric card.

Use tabular numerals for percentages and counts.

---

## 21. Tables and Lists

Tables are acceptable for dense administrative data such as:

- members,
- positions,
- periods,
- templates,
- activity exports.

Use table layout only when cross-column comparison matters.

For workflow items, prefer responsive rows / list objects over wide tables.

### Mobile strategy

Tables must either:

- collapse into cards / rows,
- hide low-priority columns behind detail view,
- or allow controlled horizontal scroll when comparison is essential.

Never compress unreadable desktop tables into mobile width.

---

## 22. Cards and Panels

Cards are not the default container for everything.

Use cards when:

- grouping distinct information,
- communicating elevation or a separate interaction zone,
- summarizing a handover or organization.

Use plain sections / dividers when:

- showing repeated rows,
- activity logs,
- comments,
- related metadata.

Default card:

- white background,
- 1px border,
- 12px radius,
- 16-24px padding,
- optional very subtle shadow.

---

## 23. Badges and Tags

Use pills for:

- workflow status,
- required / optional,
- role labels where helpful,
- compact category labels.

Do not decorate every metadata value as a badge.

Badges should remain short, ideally 1-3 words.

---

## 24. Search UI

Global search should feel fast and operational.

Potential search result types:

- handover items,
- programs,
- stakeholders,
- documents / references,
- outstanding tasks.

Use a command-palette style overlay only when global search is implemented. Search result rows should show:

- title,
- object type,
- organization / division context,
- latest relevant metadata.

---

## 25. Empty States

Empty states should explain the next action.

Bad:

> Nothing here.

Better:

> No handover items yet. Add the first required item or start from a checklist template.

Empty states may use a restrained illustration or icon, but copy and CTA are the primary tools.

---

## 26. Loading States

Use skeletons shaped like the final content.

Examples:

- dashboard metric skeleton,
- list-row skeleton,
- detail-panel skeleton.

Avoid generic full-screen spinners when meaningful structure can be shown.

---

## 27. Error States

### Inline errors

Use for:

- form validation,
- invalid URL,
- missing required revision note.

### Contextual errors

Use for:

- failure to save,
- failed status transition,
- unauthorized action.

### Page-level errors

Use for:

- unavailable handover,
- invalid organization access,
- unrecoverable loading failure.

Error messages should state:

1. what happened,
2. whether user data was saved,
3. what to do next.

---

## 28. Notifications

In-app notifications should be concise and action-oriented.

Examples:

- Item assigned to you
- Item ready for review
- Revision requested
- Item verified
- Deadline approaching

Unread state should use restrained emphasis, not large colored surfaces.

---

## 29. Responsive Behavior

### Breakpoints

Use Tailwind defaults unless project implementation defines otherwise:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Desktop

- persistent sidebar,
- multi-column dashboard where useful,
- wider detail / side-panel combinations.

### Tablet

- collapsible sidebar,
- dashboard grids reduce columns,
- preserve action hierarchy.

### Mobile

- single-column layout,
- minimum 16px page padding,
- 44px primary touch targets,
- dialogs may become bottom sheets or full-screen panels,
- data-heavy tables simplify into list objects,
- action buttons never wrap into unreadable multi-line controls.

Use `min-h-[100dvh]`, not `h-screen`, for viewport-height layouts.

---

## 30. Accessibility

### Contrast

- WCAG AA minimum for normal text.
- Primary button text must maintain strong contrast.
- Muted labels must remain readable.

### Keyboard

All interactive controls must support keyboard access.

### Focus

Use a visible focus treatment, typically:

```css
outline: 2px solid #533afd;
outline-offset: 2px;
```

or equivalent Tailwind / shadcn focus ring.

### Status

Never use color alone.

### Forms

Every input must have a programmatic label and error association.

### Motion

Honor `prefers-reduced-motion`.

### Touch

Interactive controls should target at least 40px, preferably 44px on mobile.

---

## 31. Motion

Authenticated product UI should use restrained motion.

Recommended motion intensity: **3-4 / 10**.

Allowed:

- subtle fade / translate on panel appearance,
- menu / dialog transitions,
- optimistic state feedback,
- progress change animation,
- compact hover / press feedback.

Marketing surfaces may use stronger but purposeful motion.

Rules:

- animate `transform` and `opacity`,
- avoid scroll listeners tied to React state,
- use Motion only where it communicates hierarchy or state change,
- reduced-motion mode must disable nonessential movement.

---

## 32. Dark Mode Stance

Handover MVP should prioritize a highly polished light product surface first.

Dark mode may be added when the core product UI is stable.

If implemented:

- use semantic CSS variables,
- preserve brand indigo,
- maintain hierarchy parity,
- do not simply invert colors,
- test every form, badge, table, and status in both modes.

The marketing site may support automatic light / dark preference independently only if the brand direction is intentionally designed for both.

---

## 33. shadcn/ui Customization Rules

shadcn/ui is an implementation foundation, not the final visual identity.

Customize at minimum:

- CSS variables,
- button radius,
- button colors,
- card radius,
- input border/focus,
- muted text,
- background / foreground,
- semantic status components.

Do not ship untouched default shadcn styling.

### Suggested primitives

Core MVP components may include:

- Button
- Input
- Textarea
- Select
- Checkbox
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Badge
- Progress
- Table
- Card
- Tooltip
- Toast / Sonner
- Avatar
- Command
- Skeleton

Add components only when a product requirement needs them.

---

## 34. Tailwind / CSS Variable Foundation

Suggested semantic token structure:

```css
:root {
  --background: #f6f9fc;
  --foreground: #0d253d;

  --card: #ffffff;
  --card-foreground: #0d253d;

  --primary: #533afd;
  --primary-foreground: #ffffff;

  --secondary: #ffffff;
  --secondary-foreground: #273951;

  --muted: #f6f9fc;
  --muted-foreground: #64748d;

  --border: #e3e8ee;
  --input: #a8c3de;
  --ring: #533afd;

  --brand-dark: #1c1e54;
  --brand-primary-deep: #4434d4;
  --brand-primary-press: #2e2b8c;
}
```

Implementation should use semantic tokens rather than raw hex values inside individual components whenever possible.

---

## 35. Marketing vs Product Summary

| Area | Marketing | Authenticated Product |
|---|---|---|
| Gradient mesh | Yes, signature element | No, except rare branded empty/onboarding surface |
| Typography | Light, expressive, larger | Compact, highly readable |
| Layout | Asymmetric / editorial | Structured / task-oriented |
| Cards | Large feature compositions | Only for meaningful grouping |
| Motion | Moderate | Restrained |
| Indigo | Strong brand CTA | Primary actions + focus |
| Deep navy | Editorial text / brand surfaces | Core text / occasional dark surface |
| Density | Airy | Medium |

---

## 36. Good Usage Examples

### Good: handover list

- white panel on soft canvas,
- row-based items,
- status pill,
- clear owner/reviewer metadata,
- one review action,
- minimal shadow.

### Good: dashboard

- large overall completion metric,
- 3-5 meaningful supporting metrics,
- waiting-review section,
- division/category breakdown,
- recent activity.

### Good: review flow

- item content first,
- reference links next,
- notes/comments below,
- verify / request revision actions clearly separated.

---

## 37. Anti-Patterns

Do not:

- use gradient mesh behind normal dashboard screens,
- use three identical marketing cards as the default layout for every feature section,
- use a card around every row,
- use indigo as body text color,
- show five equal primary buttons on one screen,
- use color alone for status,
- turn comments into chat bubbles,
- overuse decorative dots,
- use fake metrics as marketing decoration,
- use giant progress bars everywhere,
- use overly thin body text,
- copy Stripe's branding, trademarks, or proprietary visual assets,
- depend on proprietary Söhne font,
- ship default shadcn styling unchanged,
- hide critical actions behind hover on mobile.

---

## 38. Product-Specific UI Checklist

Before a Handover screen is considered done, confirm:

- [ ] User understands which organization and period they are viewing.
- [ ] Current role / permission context is clear when relevant.
- [ ] Primary action is obvious.
- [ ] Status is visible as text, not only color.
- [ ] Owner / reviewer information is available where relevant.
- [ ] Required vs optional item is distinguishable.
- [ ] Loading state exists.
- [ ] Empty state exists where applicable.
- [ ] Error state exists.
- [ ] Mobile layout is explicitly tested.
- [ ] Keyboard focus is visible.
- [ ] Touch targets are usable.
- [ ] No unnecessary card nesting.
- [ ] No marketing decoration leaks into dense operational screens.
- [ ] Typography remains readable at normal zoom.

---

## 39. Final Design Pre-Flight

### Brand

- [ ] Indigo `#533afd` is used primarily for action, link, focus, or intentional brand emphasis.
- [ ] Deep navy / ink remains the dominant text family.
- [ ] Gradient mesh is limited to marketing / branded surfaces.
- [ ] No proprietary font dependency exists.

### Product usability

- [ ] One clear primary action per local screen context.
- [ ] Status workflow is consistent with product semantics.
- [ ] Same action uses the same verb everywhere.
- [ ] Forms use labels above fields.
- [ ] Repeated workflow items are not unnecessarily card-heavy.
- [ ] Dashboard metrics answer actionable questions.

### Accessibility

- [ ] WCAG AA contrast is met.
- [ ] Focus states are visible.
- [ ] Keyboard navigation works.
- [ ] Color is never the sole status indicator.
- [ ] Reduced-motion preference is honored.
- [ ] Mobile touch targets are 40-44px minimum.

### Responsive

- [ ] Desktop navigation stays on one line where applicable.
- [ ] Sidebar has a mobile fallback.
- [ ] Tables have an explicit mobile strategy.
- [ ] No primary CTA wraps awkwardly.
- [ ] `100dvh` behavior is used for viewport-height layouts.

### Visual consistency

- [ ] Button geometry is consistently pill-shaped.
- [ ] Input radius is consistent.
- [ ] Card/panel radius is consistent.
- [ ] Border and shadow treatments are restrained.
- [ ] shadcn components are customized to Handover tokens.

---

## 40. Implementation Principle

Handover should feel like a polished operational system, not a marketing site trapped inside a dashboard.

Use Stripe-inspired language where it creates confidence and brand recognition. Remove it where it competes with speed, clarity, or repeated task execution.

The final rule is simple:

> **Marketing can express the brand. Product UI must express the workflow.**
