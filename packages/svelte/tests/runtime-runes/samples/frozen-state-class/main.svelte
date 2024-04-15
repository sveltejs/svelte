<script>
	class Counter {
		count = 0
	}
	const counter = $state.frozen(new Counter());
	counter.count++;
</script>

{counter.count}
