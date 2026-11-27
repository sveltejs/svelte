<script>
	class Counter {
		count = $state(0);
	}

	/** @type {Counter | undefined} */
	let counter;

	function get_counter() {
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

	$effect.pre(() => {
		n;
		get_counter();
	});
</script>

<button
	onclick={() => {
		n++;
		get_counter().count++;
	}}>both</button
>
<button onclick={() => get_counter().count++}>increment</button>
