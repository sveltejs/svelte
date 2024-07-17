<script>
	function store() {
		return {
			subscribe: (cb) => {
				setTimeout(() => {
					cb(42);
				}, 100);

				return () => {};
			}
		};
	}

	const value = store();
	const derivedValue = $derived($value);
</script>

{$value} / {derivedValue}
