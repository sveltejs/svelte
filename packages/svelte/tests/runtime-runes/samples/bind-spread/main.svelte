<script>
	let check = $state(true);

	let check_bindings = [
		() => check,
		(v) => {
			console.log('check', v);
			check = v;
		}
	];

	function getArrayBindings() {
		console.log('getArrayBindings');
		return check_bindings;
	}

	function getObjectBindings() {
		console.log('getObjectBindings');
		const [get, set] = check_bindings;
		return { get, set };
	}
</script>


<input type="checkbox" bind:checked={check_bindings[0], check_bindings[1]} />

<input type="checkbox" bind:checked={...check_bindings} />

<input type="checkbox" bind:checked={...getArrayBindings()} />

<input type="checkbox" bind:checked={...getObjectBindings()} />
