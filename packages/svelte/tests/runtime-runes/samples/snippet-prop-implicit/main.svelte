<script>
	import Counter from './Counter.svelte';
</script>

<Counter>
	{#snippet foo(n)}
		<p>clicks: {n}</p>
	{/snippet}
</Counter>
