<script>
  const empty_bindings_array = []
  const empty_bindings_object = {}
  const incompatible_bindings_object = {
		read() {
			console.log('read');
			return true;
		},
		write(v) {
			console.log('write', v);
		}
	}
	const undefined_bindings_array = [undefined, undefined];
	const undefined_bindings_object = { get: undefined, set: undefined };
	const null_bindings_array = [null, null];
	const null_bindings_object = { get: null, set: null };

	function onchange(event) {
		console.log('change', event.currentTarget.checked);
	}
</script>

<input type="checkbox" {onchange} />

<input type="checkbox" bind:checked={...empty_bindings_array} {onchange} />

<input type="checkbox" bind:checked={...empty_bindings_object} {onchange} />

<input type="checkbox" bind:checked={...incompatible_bindings_object} {onchange} />

<input type="checkbox" bind:checked={...undefined_bindings_array} {onchange} />

<input type="checkbox" bind:checked={...undefined_bindings_object} {onchange} />

<input type="checkbox" bind:checked={...null_bindings_array} {onchange} />

<input type="checkbox" bind:checked={...null_bindings_object} {onchange} />
