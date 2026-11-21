<script lang="ts">
	let { load }: { load: (name: string) => Promise<string> } = $props();

	const a = $derived(await load('a'));
	// because of this, `b` is only loaded once `a` is done, even though it doesn't depend on it
	await Promise.resolve();
	const b = $derived(await load('b'));
</script>

<!-- `a` can only be read once `b` is done -->
<output>{a} {b}</output>
