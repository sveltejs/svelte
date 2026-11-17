<script module lang="ts">
	// Keep the diagnostic bounded even if the eligibility guard regresses: a
	// fourth request finishes without another write instead of starving timers.
	let calls = 0;
</script>

<script lang="ts">
	let count = $state(0);

	function load() {
		const request = ++calls;
		return Promise.resolve().then(() => {
			if (request <= 3) count++;
			return 42;
		});
	}

	const result = $derived(await load());
</script>

<output>{count} / {result} / {calls}</output>
