---
title: {let/const ...}
---

Declaration tags define local variables inside markup with `const` or `let`:

<!-- codeblock:start {"title":"Declaration tags"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let boxes = [{ width: 10, height: 10 }, { width: 15, height: 15 }];
</script>

{#each boxes as box}
	{const area = box.width * box.height}
	{const label = `${box.width} ⨉ ${box.height} = ${area}`}

	<p>{label}</p>
{/each}
```
<!-- codeblock:end -->

> [!NOTE] Declaration tags are available since Svelte 5.56.

> [!NOTE] The [`{@const ...}`](@const) syntax is considered legacy — use declaration tags instead.

When values should be reactive, you can use `$state` and `$derived`:

<!-- codeblock:start {"title":"Reactive declaration tags"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let user = $state({ name: 'Svelte' });
	let editing = $state(false);
</script>

<p>Hello {user.name}</p>
<button onclick={() => editing = true}>edit name</button>

{#if editing}
	{let name = $state(user.name)}
	{const greeting = $derived(`Hello ${name}`)}

	<hr>
	<input bind:value={name} />
	<p>{greeting}</p>

	<button onclick={() => {
		user.name = name;
		editing = false;
	}}>save</button>
{/if}
```
<!-- codeblock:end -->

Declaration tags can be used anywhere inside the component. They can reference values declared outside themselves (for example in the `<script>` tag or in `{#each ...}` blocks) and are 'visible' to everything in the same lexical scope (i.e. siblings, and children of those siblings):

<!-- codeblock:start {"title":"Declaration tag scope"} -->
```svelte
<!--- file: App.svelte --->
{const hello = 'hello'}
{hello} <!-- 'hello' -->
<div>
	{const hello = 'hi'}
	{hello} <!-- 'hi' -->
	<div>
		{hello} <!-- 'hi' -->
	</div>
</div>
{hello} <!-- 'hello' -->
```
<!-- codeblock:end -->
