<script module lang="ts">
	let run: (arg?: { x: number }) => number;
</script>

<script lang="ts">
	const object = { x: 0 };
	run = (arg = object) => (arg.x = 42);

	await Promise.resolve();
	// The binding is outside the instance, but its assigned function closes over instance state.
	run();

	const result = $derived(await Promise.resolve(object.x));
</script>

<output>{result}</output>
