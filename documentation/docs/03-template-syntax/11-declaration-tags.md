---
title: {const/let ...}
---

Declaration tags define local variables inside markup.

You can use `let` and `const` declarations:

<!-- codeblock:start {"title":"Declaration tags"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let boxes = [{ width: 10, height: 10 }, { width: 15, height: 15 }];
</script>

{#each boxes as box}
	{const area = box.width * box.height}
	{const label = `${area} square pixels`}

	<p>{label}</p>
{/each}
```
<!-- codeblock:end -->

Unlike [`{@const ...}`](@const), declaration tags are plain JavaScript declarations. This means `{const/let ...}` is not reactive by itself; use runes such as `$state` or `$derived` when you need reactive values:

<!-- codeblock:start {"title":"Reactive declaration tags"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let user = $state({ name: 'Svelte' });
	let modify = $state(false);
</script>

<p>Hello {user.name}</p>
<button onclick={() => modify = true}>modify name</button>

{#if modify}
	{let name = $state(user.name)}
	{const greeting = $derived(`Hello ${name}`)}

	<input bind:value={name} />
	<p>{greeting}</p>

	<button onclick={() => {
		user.name = name;
		modify = false;
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
