<script lang="ts">
	let { x, load }: {
		x: number;
		load: (value: number) => Promise<number>;
	} = $props();
	let value = $derived(await load(x));
</script>

<span>{value}</span>
