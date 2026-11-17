<script lang="ts">
	let { input, load }: { input: number; load: (value: number) => Promise<number> } = $props();
	const origin = input;
	let local = $state(input);
	console.log(`init ${input}`);
	// The producer has no direct prop dependency: only the factory read input.
	const result = $derived(await load(local));
</script>
<p>{input}|{origin}|{local}|{result}</p>
