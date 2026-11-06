<script>
	let count = $state(0);
	let object = $derived({ count });

	/** @type {{ count: number } | undefined} */
	let seen;

	$effect(() => {
		console.log(`effect: ${count}`);

		return () => {
			seen = object;
			console.log(`teardown: ${object === object} ${object.count}`);
		};
	});

	$effect(() => {
		count;
		return () => console.log(`other teardown: ${object === seen}`);
	});
</script>

<button onclick={() => count++}>count++</button>
