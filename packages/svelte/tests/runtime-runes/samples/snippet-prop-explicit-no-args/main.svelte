<script>
	import Counter from './Counter.svelte';
</script>

{#snippet foo()}
	<p>foo</p>
{/snippet}

<Counter {foo} />
