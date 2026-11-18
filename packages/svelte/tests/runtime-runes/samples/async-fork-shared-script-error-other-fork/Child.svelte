<script lang="ts">
	let { x, load }: {
		x: number;
		load: (value: number) => Promise<number>;
	} = $props();

	console.log('created');
	const first = $derived(await load(x));
	const second = $derived(await load(first + 10));
	console.log(`continued ${first} ${second}`);
</script>

<p>{first}/{second}</p>
