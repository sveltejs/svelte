<script>
	import Foo from './Foo.svelte';
	const Comp = { Foo };

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<Foo />
	<Comp.Foo />
{/if}