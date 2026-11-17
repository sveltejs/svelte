<script lang="ts">
	let { input, load }: { input: number; load: (value: number) => Promise<number> } = $props();
	const origin = input;
	let local = $state(input);
	function edit() { local++; }
	console.log(`init ${input}`);
	const result = $derived(await load(input));
</script>

<button onclick={edit}>edit local</button>
<p>{input}|{origin}|{local}|{result}</p>
