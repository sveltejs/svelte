<script>
	function throwError() {
		throw new Error('nope');
	}

	const createElement = throwError;
	const createElement$ = throwError;

	export let value = template() + template$();

	function template() {
		return 'a';
	}

	function template$() {
		return 'b';
	}
</script>

<p>{value}</p>
