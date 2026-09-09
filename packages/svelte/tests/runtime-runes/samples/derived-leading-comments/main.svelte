<script>
	function write(value) {
		return foo = value;
	}

	// a leading comment on the declaration
	// that spans more than one line
	let foo = $derived('x');
	let bar = write('y');

	const ctx = {
		get later() {
			return later;
		}
	};

	// a leading comment on the declaration
	// that spans more than one line
	let later = $derived.by(() => 'LATER');
</script>

<p>{foo}:{bar}</p>
<p>{ctx.later}</p>
<input bind:value={later} />
