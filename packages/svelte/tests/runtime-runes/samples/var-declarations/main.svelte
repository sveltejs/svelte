<script>
	console.log(foo, double);
	var foo = $state(10);
	var double = $derived(foo * 2);
	console.log(foo, double);

	function wrap(initial) {
		var _value = $state(initial);

		return {
			get() {
				return _value;
			},
			set(state) {
				_value = state;
			}
		};
	}

	var wrapped = wrap(0);
	console.log(wrapped.get());
	wrapped.set(1);
	console.log(wrapped.get());
</script>
