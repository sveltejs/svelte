<script lang="ts">
	let { value = $bindable(1) } = $props();
	let local = $state(1n);
	let calls = 0;
	const object = $state({ label: 'stable' });
	const origin = value;

	function bump() {
		console.log(object);
		calls++;
		local++;
		value++;
	}

	console.log(object);
	const result = $derived(await Promise.resolve(value));
</script>

<input type="number" bind:value />
<button onclick={bump}>captured state and prop</button>
<button onclick={() => local++}>direct state update</button>
<button onclick={() => { calls++; local++; }}>ordinary local update</button>
<output>{value} {local} {origin} {calls} {result} {object.label}</output>
