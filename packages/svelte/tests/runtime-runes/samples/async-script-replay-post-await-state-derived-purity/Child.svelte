<script lang="ts">
	await Promise.resolve();
	let n = $state(0);
	const bad = $derived(n++);
</script>

<output>{bad}</output>
