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

	const value1 = store();
	const value2 = store();
	const derivedValue = $derived($value1);
</script>

{$value2} / {derivedValue}
