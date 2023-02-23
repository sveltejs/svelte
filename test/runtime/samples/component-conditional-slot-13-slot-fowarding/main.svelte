<script>
	import Foo from "./Foo.svelte";
	export let condition = false;
</script>

<Foo>
	{#if condition}
		<div slot="a">hello a</div>
	{/if}
	<div slot="b">hello b</div>
</Foo>
