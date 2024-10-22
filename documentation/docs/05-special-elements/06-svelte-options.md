---
title: <svelte:options>
---

```svelte
<svelte:options option={value} />
```

The `<svelte:options>` element provides a place to specify per-component compiler options, which are detailed in the [compiler section](svelte-compiler#compile). The possible options are:

- `immutable={true}` — you never use mutable data, so the compiler can do simple referential equality checks to determine if values have changed
- `immutable={false}` — the default. Svelte will be more conservative about whether or not mutable objects have changed
- `accessors={true}` — adds getters and setters for the component's props
- `accessors={false}` — the default
- `runes={true}` — forces a component into _runes mode_ (see the [Legacy APIs](legacy-overview) section)
- `runes={false}` — forces a component into _legacy mode_
- `namespace="..."` — the namespace where this component will be used, most commonly "svg"; use the "foreign" namespace to opt out of case-insensitive attribute names and HTML-specific warnings
- `customElement={...}` — the [options](custom-elements#Component-options) to use when compiling this component as a custom element. If a string is passed, it is used as the `tag` option

```svelte
<svelte:options customElement="my-custom-element" />
```
