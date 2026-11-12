<script>
	class Counter {
		count = $state(0);
		double = $derived(this.count * 2);
	}

	/** @type {Counter | undefined} */
	let counter;

	/** @param {number} [_n] */
	function get_counter(_n) {
		if (!counter) {
			$effect.root(() => {
				const c = (counter = new Counter());

				$effect(() => {
					console.log(c.count);
				});
			});
		}

		return /** @type {Counter} */ (counter);
	}

	let n = $state(0);
</script>

<button onclick={() => n++}>rerun</button>
<button onclick={() => get_counter().count++}>increment</button>

{#await get_counter(n) then c}
	<p>{c.double}</p>
{/await}
