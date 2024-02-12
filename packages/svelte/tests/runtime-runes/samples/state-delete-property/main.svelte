<script>
	let numbers = $state({ a: 1, b: 2, c: 3 });
</script>

<button onclick={() => { numbers.b = 2; }}>set</button>
<button onclick={() => { delete numbers.b; }}>delete</button>
<p>{Object.keys(numbers)}</p>
<p>{JSON.stringify(numbers)}</p>
