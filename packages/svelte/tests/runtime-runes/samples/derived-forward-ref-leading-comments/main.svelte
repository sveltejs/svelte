<script>
	const ctx = {
		get later() {
			return later;
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	let later = $derived.by(() => 'LATER');
</script>

<p>{ctx.later}</p>
<input bind:value={later} />
