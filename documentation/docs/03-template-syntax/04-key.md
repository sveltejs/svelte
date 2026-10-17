---
title: {#key ...}
tags: template-key
---

```svelte
<!--- copy: false  --->
{#key expression}...{/key}
```

Key blocks destroy and recreate their contents when the value of an expression changes. When used around components, this will cause them to be reinstantiated and reinitialised:

```svelte
{#key value}
	<Component />
{/key}
```

It's also useful if you want a transition to play whenever a value changes:

```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```

To recreate the contents when any of several reactive values changes, use an inline array or object:

```svelte
{#key [key1, key2]}
	<Component />
{/key}
```

```svelte
{#key { key1, key2 }}
	<Component />
{/key}
```

Each evaluation creates a new array or object. In runes mode, these are compared by reference rather than by their contents: using an existing object as the key only recreates the contents when its reference changes, not when its properties change.
