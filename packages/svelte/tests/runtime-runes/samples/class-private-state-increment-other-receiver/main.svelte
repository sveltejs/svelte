<script>
	class Counter {
		#count = $state(1);

		bump(other) {
			other.#count++;
		}

		drop(other) {
			--other.#count;
		}

		getCount() {
			return this.#count;
		}
	}

	const a = new Counter();
	const b = new Counter();
</script>

<button onclick={() => a.bump(b)}>{b.getCount()}</button>
<button onclick={() => a.drop(b)}>drop</button>
