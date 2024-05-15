<script>
	class Counter {
		count = $state.frozen({ a: 0 });
	}
	const counter = new Counter();
</script>

<button on:click={() => {
	try {
		counter.count.a++
	} catch (e) {
		console.log('read only')
	}
}}>{counter.count.a}</button>
