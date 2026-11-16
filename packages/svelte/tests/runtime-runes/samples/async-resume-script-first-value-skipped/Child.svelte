<script lang="ts">
	let { x, load }: {
		x: number;
		load: (value: number) => Promise<number>;
	} = $props();
	const value = $derived(await load(x));
	console.log(value);
</script>

<span>{value}</span>
