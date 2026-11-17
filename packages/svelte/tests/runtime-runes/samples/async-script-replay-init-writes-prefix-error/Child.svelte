<script lang="ts">
	let { input, load }: {
		input: number;
		load: (value: number) => Promise<number>;
	} = $props();

	// The producer depends on an immutable prefix capture, not directly on the
	// reactive prop. Replacing its failure therefore requires prefix revalidation.
	const key = input;
	console.log(`prefix ${key}`);
	const value = $derived(await load(key));
</script>

<p>{key}/{value}</p>
