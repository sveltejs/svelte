<script>
	class Counter {
		count = $state();
		#doubled = $derived(this.count * 2);

		nope() {
			this.#doubled++;
		}
	}
</script>
