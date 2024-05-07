<script>
	let plus = $state("0");
	let plus_before = $state("0");
	let minus = $state("0");
	let minus_before = $state("0");
	
	function increment() {
		console.log(plus++);
	}

	function decrement() {
		console.log(minus--);
	}

	function increment_before() {
		console.log(++plus_before);
	}

	function decrement_before() {
		console.log(--minus_before);
	}
</script>

<button id="increment" onclick={increment}>
	{plus}
</button>

<button id="decrement" onclick={decrement}>
	{minus}
</button>

<button id="increment_before" onclick={increment_before}>
	{plus_before}
</button>

<button id="decrement_before" onclick={decrement_before}>
	{minus_before}
</button>