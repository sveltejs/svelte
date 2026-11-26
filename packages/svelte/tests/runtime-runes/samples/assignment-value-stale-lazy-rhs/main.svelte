<script>
	let count1 = $state(0);
	let count2 = $state(0);
	let cache = $state({});

	function go() {
		count1++;
		const value = cache.value ??= get_value();
	}

	function get_value() {
		count2++;
		return 42;
	}
</script>

<button onclick={go}>go</button>
<p>count1: {count1}, count2: {count2}</p>
