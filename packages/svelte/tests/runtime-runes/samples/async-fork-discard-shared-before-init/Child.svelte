<script lang="ts">
	let { x, begin, load }: {
		x: number;
		begin: () => Promise<void>;
		load: (value: number) => Promise<number>;
	} = $props();

	await begin();
	const value = $derived(await load(x));
	console.log(`continued ${value}`);
</script>

<p>{value}</p>
