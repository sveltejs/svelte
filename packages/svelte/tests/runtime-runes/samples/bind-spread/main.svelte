<script>
	let check = $state(true);

	const get = () => check;
	const set = (v) => {
		console.log('check', v);
		check = v;
	};
	const bindings = [get, set];
	const nested = {
		deep: {
			bindings: [get, set],
		},
	};

	function getBindings() {
		console.log('getBindings');
		return [get, set];
	}
</script>

<input type="checkbox" bind:checked={get, set} />

<input type="checkbox" bind:checked={...bindings} />

<input type="checkbox" bind:checked={...nested.deep.bindings} />

<input type="checkbox" bind:checked={...getBindings()} />

<input type="checkbox" bind:checked={...(() => [get, set])()} />
