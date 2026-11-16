<script lang="ts">
	let input = $state(1);
	let continuations = $state(0);

	function begin() {
		console.log('begin');
		return Promise.resolve();
	}

	function snapshot_of(value: number) {
		console.log(['snapshot', value]);
		return Promise.resolve(value);
	}

	function continued(a: number, b: number) {
		continuations++;
		console.log(['continued', a, b]);
	}

	const load = (value: number) => Promise.resolve(value + 1);
	console.log('prefix');

	await begin();
	const snapshot = await snapshot_of(input);
	console.log(['snapshot ready', snapshot]);
	let a = $derived(await load(input));
	let b = $derived(await load(a + snapshot));
	continued(a, b);
</script>

<button onclick={() => input++}>update</button>
<output>{#if b}<p>{a} {snapshot} {b} {continuations}</p>{/if}</output>
