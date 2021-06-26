---
title: Checking for slot content
---

In some cases, you may want to control parts of your component based on whether the parent passes in content for a certain slot. Perhaps you have a wrapper around that slot, and you don't want to render it if the slot is empty. Or perhaps you'd like to apply a class only if the slot is present. You can do this by checking the properties of the special `$$slots` variable.

`$$slots` is an object whose keys are the names of the slots passed in by the parent component. If the parent leaves a slot empty, then `$$slots` will not have an entry for that slot.

Notice that both instances of `<Project>` in this example render a container for comments and a notification dot, even though only one has comments. We want to use `$$slots` to make sure we only render these elements when the parent `<App>` passes in content for the `comments` slot.

In `Project.svelte`, update the `class:has-discussion` directive on the `<article>`:

```html
<article class:has-discussion={$$slots.comments}>
```

Next, wrap the `comments` slot and its wrapping `<div>` in an `if` block that checks `$$slots`:

```html
{#if $$slots.comments}
	<div class="discussion">
		<h3>Comments</h3>
		<slot name="comments"></slot>
	</div>
{/if}
```

Now the comments container and the notification dot won't render when `<App>` leaves the `comments` slot empty.
