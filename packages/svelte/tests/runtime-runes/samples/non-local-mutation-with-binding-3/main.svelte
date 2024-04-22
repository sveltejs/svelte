<script>
	import Counter from './Counter.svelte';

	let object = $state({
		shared: { count: 0 },
		notshared: { count: 0 }
	});
</script>

<Counter
	bind:shared={object.shared}
	notshared={object.notshared}
/>
