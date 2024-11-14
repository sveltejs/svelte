---
title: Select multiple
---

A select can have a `multiple` attribute, in which case it will populate an array rather than selecting a single value.

Returning to our [earlier ice cream example](/tutorial/group-inputs), we can replace the checkboxes with a `<select multiple>`:

```svelte
<h2>Flavours</h2>

<select multiple bind:value={flavours}>
	{#each menu as flavour}
		<option value={flavour}>
			{flavour}
		</option>
	{/each}
</select>
```

> Press and hold the `control` key (or the `command` key on MacOS) for selecting multiple options.
