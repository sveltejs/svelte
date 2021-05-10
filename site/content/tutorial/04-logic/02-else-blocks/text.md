---
title: Else blocks
---

Since the two conditions — `if user.loggedIn` and `if !user.loggedIn` — are mutually exclusive, we can simplify this component slightly by using an `else` block:

```html
<button on:click={toggle}>
	{#if user.loggedIn}
			Log out
	{:else}
			Log in
	{/if}
</button>
```

> A `#` character always indicates a *block opening* tag. A `/` character always indicates a *block closing* tag. A `:` character, as in `{:else}`, indicates a *block continuation* tag. Don't worry — you've already learned almost all the syntax Svelte adds to HTML.
