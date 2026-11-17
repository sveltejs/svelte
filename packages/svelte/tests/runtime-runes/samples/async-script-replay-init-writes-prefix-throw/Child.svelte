<script lang="ts">
	let { input, load, failure }: {
		input: number;
		load: (value: number) => Promise<number>;
		failure: Error;
	} = $props();

	console.log(`init ${input}`);
	if (input === 1) throw failure;
	const value = $derived(await load(input));
</script>

<p>{value}</p>
