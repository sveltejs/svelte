---
title: 'Compiler warnings'
---

Svelte warns you at compile time if it catches potential mistakes, such as writing inaccessible markup.

Some warnings may be incorrect in your concrete use case. You can disable such false positives by placing a `<!-- svelte-ignore <code> -->` comment above the line that causes the warning. Example:

```svelte
<!-- svelte-ignore a11y_autofocus -->
<input autofocus />
```

You can list multiple rules in a single comment (separated by commas), and add an explanatory note (in parentheses) alongside them:

```svelte
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
<div onclick>...</div>
```

@include .generated/compile-warnings.md
