---
title: Else blocks
---

Since the two conditions — `if user.loggedIn` and `if !user.loggedIn` — are mutually exclusive, we can simplify this component slightly by using an `else` block:

```html
{#if user.loggedIn}
	<button on:click={toggle}>
		Log out
	</button>
{:else}
	<button on:click={toggle}>
		Log in
	</button>
{/if}
```

> A `#` character always indicates a *block opening* tag. A `/` character always indicates a *block closing* tag. A `:` character, as in `{:else}`, indicates a *block continuation* tag. Don't worry — you've already learned almost all the syntax Svelte adds to HTML.