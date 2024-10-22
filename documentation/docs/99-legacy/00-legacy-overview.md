---
title: Overview
---

Svelte 5 introduced some significant changes to Svelte's API, including [runes](what-are-runes), [snippets](snippet) and event attributes. As a result, some Svelte 3/4 features are deprecated (though supported for now, unless otherwise specified) and will eventually be removed. We recommend that you incrementally [migrate your existing code](v5-migration-guide).

The following pages document these features for

- people still using Svelte 3/4
- people using Svelte 5, but with components that haven't yet been migrated

Since Svelte 3/4 syntax still works in Svelte 5, we will distinguish between _legacy mode_ and _runes mode_. Once a component is in runes mode (which you can opt into by using runes, or by explicitly setting the `runes: true` compiler option), legacy mode features are no longer available.
