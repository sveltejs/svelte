<script>
	let _x;

	function getX () {
		return _x;
	}

	export let y = 1;

	let xGetter;
	export let x;

	$: {
		_x = y * 2;
		xGetter = getX;
	}

	$: x = xGetter();
</script>

<p>{x}</p>