<script lang="ts">
	let { load }: { load: (name: string) => Promise<string> } = $props();

	// loaded in parallel, so `b` can fail while `a` is still being awaited
	const a = $derived(await load('a'));
	const b = $derived(await load('b'));
</script>

<p>{a} {b}</p>
