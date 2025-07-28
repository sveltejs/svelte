<script>
	let check = $state(true);

	let check_bindings = [
		() => check,
		(v) => {
			console.log('check', v);
			check = v;
		}
	];

	function getBindings() {
		console.log('getBindings');
		return check_bindings;
	}
</script>


<input type="checkbox" bind:checked={check_bindings[0], check_bindings[1]} />

<input type="checkbox" bind:checked={...check_bindings} />

<!-- <input type="checkbox" bind:checked={...check_bindings} /> -->
<input type="checkbox" bind:checked={...getBindings()} />
