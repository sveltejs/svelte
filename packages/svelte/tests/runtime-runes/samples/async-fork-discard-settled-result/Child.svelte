<script lang="ts">
	let { count, load }: {
		count: number;
		load: (value: number) => Promise<number>;
	} = $props();

	const first = $derived(await load(count));
	const second = $derived(await load(first + 10));
	console.log(`continued ${first} ${second}`);
</script>

<p>{first} {second}</p>
