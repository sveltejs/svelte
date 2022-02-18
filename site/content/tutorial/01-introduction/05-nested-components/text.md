---
title: Nested components
---

It would be impractical to put your entire app in a single component. Instead, we can import components from other files and then use them as though we were including elements.

We now present you 2 files in the editor on the right (upper bar) to click on, `App.svelte` and `Nested.svelte`.

Each component is a reusable self-contained block of code that encapsulates HTML, CSS, and JavaScript that belong together, written into a `.svelte` file.

Let's add a `<script>` tag to `App.svelte` that imports the file and our component `Nested.svelte` to our app...

```html
<script>
	import Nested from './Nested.svelte';
</script>
```

...then add the component `Nested` to use it in the app markup:

```html
<p>This is a paragraph.</p>
<Nested/>
```

Notice that even though `Nested.svelte` has a `<p>` element, the styles from `App.svelte` don't leak in.

Also notice that the component name `Nested` is capitalised. This convention has been adopted to allow us to differentiate between user-defined components and regular HTML tags.
