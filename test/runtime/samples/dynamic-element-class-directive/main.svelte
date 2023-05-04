<script>
	import Link from "./Link.svelte";
	let foo = [
		{ text: "foo0" },
		{ text: "foo1" },
		{ text: "foo2" },
		{ text: "foo3" },
	];
</script>

<Link item={{ text: "foo" }} />
<Link item={foo[0]} />
<Link bind:item={foo[0]} />
{#each foo as item}
	<Link bind:item />
{/each}
