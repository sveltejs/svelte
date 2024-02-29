<script>
	export class Counter {
		count = $state(0);
		doubled = $derived(this.count * 2);

		constructor(initialCount = 0) {
			this.count = initialCount;
		}
	}

	const counter = new Counter(1);
</script>

{counter.doubled}

