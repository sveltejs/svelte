<script>
	import Counter from './Counter.svelte';

	const object = $state({ count: 0 });
</script>

<Counter {object} />
