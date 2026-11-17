<script lang="ts">
	function record(label: string) {
		console.log(label);
		queueMicrotask(() => console.log(`microtask ${label}`));
	}

	await Promise.resolve();
	record('one');
	record('two');
</script>

<output>done</output>
