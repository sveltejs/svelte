<script>
	import Counter from './Counter.svelte';

	let object = $state({ count: 0 });
</script>

<Counter bind:object />

<p>object.count: {object.count}</p>
