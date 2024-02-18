<script>
	let count = $state(0);

	function _increment() {
		count += 1;
	}

	const decrement = () => {
		count -= 1;
	}

	const double = function() {
		count = count * 2;
	}

	export { _increment as increment, decrement, double }
</script>

<p>
	clicks: {count}
</p>
