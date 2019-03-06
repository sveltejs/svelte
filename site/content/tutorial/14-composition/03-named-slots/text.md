---
title: Named slots
---

The previous example contained a *default slot*, which renders the direct children of a component. Sometimes you will need more control over placement, such as with this `<ContactCard>`. In those cases, we can use *named slots*.

In `ContactCard.svelte`, add a `name` attribute to each slot:

```html
<article class="contact-card">
	<h2>
		<slot name="name">
			<span class="missing">Unknown name</span>
		</slot>
	</h2>

	<div class="address">
		<slot name="address">
			<span class="missing">Unknown address</span>
		</slot>
	</div>

	<div class="email">
		<slot name="email">
			<span class="missing">Unknown email</span>
		</slot>
	</div>
</article>
```

Then, add elements with corresponding `slot="..."` attributes inside the `<ContactCard>` component:

```html
<ContactCard>
	<span slot="name">
		P. Sherman
	</span>

	<span slot="address">
		42 Wallaby Way<br>
		Sydney
	</span>
</ContactCard>
```