<script lang="ts">
	let input = $state(1);
	const load = (value: number) => Promise.resolve(value);
	console.log('prefix');
	await load(input);
	const snapshot = await load(input);
	console.log(snapshot);
	let value = $derived(await load(input + snapshot));
	console.log(value);
</script>

<button onclick={() => input++}>update</button>
<output>{value} {snapshot}</output>
