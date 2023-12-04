<script>
	import Counter from './Counter.svelte';
</script>

{#snippet foo(n)}
	<p>clicks: {n}</p>
{/snippet}

<Counter {foo} />
