<script>
	import Counter from './Counter.svelte';

	function createCounter() {
		let count = $state(0)
		return {
			get count() {
				return count;
			},
			set count(upd) {
				count = upd
			}
		}
	}

	class CounterClass {
		count = $state(0);
	}

	const counterSetter = createCounter();
	const counterClass = new CounterClass();
</script>

<Counter object={counterSetter} />
<Counter object={counterClass} />
