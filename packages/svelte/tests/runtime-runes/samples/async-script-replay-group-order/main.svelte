<script lang="ts">
	function record(value: string) {
		console.log(value);
		queueMicrotask(() => console.log(`micro ${value}`));
		return value;
	}
	const start = await Promise.resolve(0);
	const a = record('a');
	const b = record('b');
</script>

<output>{start} {a} {b}</output>
