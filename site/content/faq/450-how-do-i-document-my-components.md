---
question: How do I document my components?
---

In editors which use the Svelte Language Server you can document Components, functions and exports using specially formatted comments.

````svelte
<script>
	/** What should we call the user? */
	export let name = 'world';
</script>

<!--
@component
Here's some documentation for this component.
It will show up on hover.

- You can use markdown here.
- You can also use code blocks here.
- Usage:
  ```tsx
  <main name="Arethra">
  ```
-->
<main>
	<h1>
		Hello, {name}
	</h1>
</main>
````

Note: The `@component` is necessary in the HTML comment which describes your component.
