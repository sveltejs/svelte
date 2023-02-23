<script>
	import Foo from "./Foo.svelte";
	export let condition1;
	export let condition2;
	export let condition3 = false;
	export let condition4 = true;
</script>

<Foo {condition1} {condition2}>
	{#if condition3}
		<div slot="a">hello a</div>
	{/if}
	{#if condition4}
		<div slot="b">hello b</div>
	{/if}
	<div slot="c">hello c</div>
</Foo>
