<script lang="ts">
	let { count, marker, load }: {
		count: number;
		marker: number;
		load: (value: number) => Promise<number>;
	} = $props();

	const first = $derived(await load(count));
	const snapshot = marker;
	const second = $derived(await load(first + 10));
	console.log(`continued ${first} ${second} ${snapshot}`);
</script>

<p>{first} {second} {snapshot}</p>
