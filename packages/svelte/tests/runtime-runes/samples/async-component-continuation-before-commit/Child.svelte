<script lang="ts">
	let { promise }: { promise: Promise<number> } = $props();
	const loaded = await promise;

	$effect(() => {
		console.log('effect ran');
	});
</script>

<p>loaded {loaded}</p>
