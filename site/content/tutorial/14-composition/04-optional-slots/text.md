---
title: Optional slots
---

In the previous example, the contact card rendered fallback text if a named slot was left empty. But for some slots, perhaps you don't want to render anything at all. We can do this by checking the properties of the special `$$slots` variable.

`$$slots` is an object whose keys are the names of the slots passed in by the parent component. If the parent leaves a slot empty, then `$$slots` will not have an entry for that slot.

In `ContactCard.svelte`, wrap the `address` and `email` slots in `if` blocks that check `$$slots`, and remove the fallbacks from each `<slot>`:

```html
{#if $$slots.address}
	<div class="address">
		<slot name="address"></slot>
	</div>
{/if}

{#if $$slots.email}
	<div class="email">
		<slot name="email"></slot>
	</div>
{/if}
```

Now the email row won't render at all when the `<App>` leaves that slot empty.
