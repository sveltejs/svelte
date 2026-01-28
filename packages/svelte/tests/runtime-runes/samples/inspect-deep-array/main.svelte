<script>
	function createState(init) {
		let values = $state(init);

		return {
			get value() {
				return $state.snapshot(values);
			},

			get workedValues() {
				let newValue = [];
				for (const value of values) {
					if (value === undefined) {
						throw new Error('undefined found');
					}

					newValue.push(value);
				}
				return newValue;
			},

			doSplice() {
				values.splice(0, 1);
			}
		};
	}

	const myState = createState([1, 2, 3, 7]);

	$inspect(myState.workedValues);
</script>

<button onclick={() => myState.doSplice()}>Delete</button>
