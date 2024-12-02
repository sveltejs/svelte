<script>
	class Counter {
		count = $state.raw({ a: 0 });
	}
	const counter = new Counter();
</script>

<button
	on:click={() => {
		counter.count.a++;
	}}>{counter.count.a}</button
>
