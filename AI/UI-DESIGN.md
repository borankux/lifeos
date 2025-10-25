# UI Design

## Design System
- Typography: Inter or Poppins; base 14-16px; line-height 1.6.
- Colors: Primary `#6200EE`, Secondary `#03DAC6`, Background `#121212`, Card `rgba(255,255,255,0.1)`, Success `#00E676`, Error `#D50000`.
- Spacing scale: 4px base (4,8,12,16,24,32,...).
- Radius: 8-16px depending on component size.
- Shadows: subtle layered for elevation (card/button/overlay levels).

## Components
- App shell: left nav, top bar, content area; responsive breakpoint at 1024px; project switcher in top bar.
- Cards: used across Kanban, notes, habits; hover elevation and subtle scale.
- Inputs: filled style with focus rings; inline validation messages.
- Buttons: primary/secondary/ghost; loading and disabled states.
- Modals/Drawers: for create/edit flows; ESC/overlay close, focus trap.

## Interactions & Motion
- Use Framer Motion for list reordering and modal transitions.
- 150-250ms animations; ease-out for entrance, ease-in for exit.
- Reduce motion setting respects OS preferences.

## Views
- Main Dashboard: GitHub-style activity calendar at the top showing year-round activity heat map; color intensity based on daily activity count; hover tooltips showing activity breakdown (tasks, diary entries, habits); click to view detailed day summary.
- Kanban: project selector (dropdown or tabs) above board; per-project WIP counters; 3-5 columns; drag-and-drop with smooth ghost, auto-scroll.
- Diary: split editor/preview pane; toolbar for markdown actions; drag-drop files; paste images.
- Habits: checklist grid; streak heatmap; progress bars with goal markers.
- Alarms: list of alarms with toggles; time picker; conflict warnings.
- Notebook: category sidebar; note list; quick search; reorder by drag.
- Q&A: collapsible categories; question details panel; link picker to notes/tasks.

## Accessibility
- Keyboard navigation for all interactive elements.
- Contrast ratio >= 4.5 for text.
- ARIA roles/labels for custom controls.

## Theming
- Dark mode default; light theme token set prepared.
- Tailwind config with CSS variables for colors to support runtime theme.
