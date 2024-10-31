---
title: {#key ...}
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
