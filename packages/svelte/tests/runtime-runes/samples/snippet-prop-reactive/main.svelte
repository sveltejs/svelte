<script>
	import Inner from './Inner.svelte';

	let show_foo = $state(true);
</script>

{#snippet foo()}
	<p>foo</p>
{/snippet}

{#snippet bar()}
	<p>bar</p>
{/snippet}

<Inner snippet={show_foo ? foo : bar} />

<button on:click={() => show_foo = false}>show bar</button>
