<script lang="ts">
	let n = $state(0);
	let value = () => n;

	for (let i = 0; i < 6; i++) {
		const read = value;
		const next = $derived.by(() => {
			console.log(i);
			return read() + 1;
		});
		value = () => next;
	}

	// Read once without a tracked reader before connecting the chain in the template.
	const initial = value();
</script>

<button onclick={() => n++}>increment</button>
<output>{initial}/{value()}</output>
