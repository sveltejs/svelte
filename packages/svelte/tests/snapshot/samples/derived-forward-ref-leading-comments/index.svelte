<script>
	const ctx = {
		get later() {
			return later;
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	const later = $derived.by(() => 'LATER');
</script>

<p>{ctx.later}</p>
