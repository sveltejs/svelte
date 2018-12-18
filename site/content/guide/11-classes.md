---
title: Classes
---

Like any attribute, the `class` attribute can be set using regular JavaScript. Suppose we had an `active` class that we wanted to apply to an element when `isActive` is true — we could do it like this:

```html
<!-- { title: 'Dynamic classes using ternaries' } -->
<script>
	let isActive = false;
</script>

<style>
	.active {
		color: red;
	}
</style>

<h1 class="{isActive ? 'active' : ''}">red if active</h1>

<label>
	<input type=checkbox bind:checked={isActive}> isActive
</label>
```

That's a little verbose though, so the `class:` directive gives you a simpler way to achieve the same thing:

```html
<!-- { title: 'Dynamic classes using directives' } -->
<script>
	let isActive = false;
</script>

<style>
	.active {
		color: red;
	}
</style>

-<h1 class="{isActive ? 'active' : ''}">red if active</h1>
+<h1 class:active={isActive}>red if active</h1>

<label>
	<input type=checkbox bind:checked={isActive}> isActive
</label>
```

As with any directive, you can use any JavaScript expression. If it's a variable name that matches the class name, you can use a shorthand:

```html
<!-- { title: 'Dynamic classes using directives' } -->
<script>
-	let isActive = false;
+	let active = false;
</script>

<style>
	.active {
		color: red;
	}
</style>

-<h1 class:active={isActive}>red if active</h1>
+<h1 class:active>red if active</h1>

<label>
-	<input type=checkbox bind:checked={isActive}> isActive
+	<input type=checkbox bind:checked={active}> active
</label>
```