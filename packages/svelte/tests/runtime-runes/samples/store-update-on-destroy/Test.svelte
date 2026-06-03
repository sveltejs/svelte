<script lang="ts">
	const { store } = $props();

	$effect(() => {
		$store;
		return () => {
			console.log($store);
			$store++;
			console.log($store);
		};
	});
</script>
