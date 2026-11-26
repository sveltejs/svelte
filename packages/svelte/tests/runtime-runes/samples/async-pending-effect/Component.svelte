<script lang="ts">
	let x = $state(false);

	$effect(() => {
		x = true;

		return () => {
			x = false;
		}
	});
</script>