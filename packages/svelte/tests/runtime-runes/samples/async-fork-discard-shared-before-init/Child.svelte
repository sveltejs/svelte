<script lang="ts">
	let { x, begin, load }: {
		x: number;
		begin: () => Promise<void>;
		load: (value: number, ready: void) => Promise<number>;
	} = $props();

	// `load` is passed the result of `begin`, so that the derived depends on it
	// and isn't created until `begin` has resolved
	const ready = await begin();
	const value = $derived(await load(x, ready));
	console.log(`continued ${value}`);
</script>

<p>{value}</p>
