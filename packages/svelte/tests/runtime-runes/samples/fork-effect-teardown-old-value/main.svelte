<script>
	import { fork } from 'svelte';

	let count = $state(0);

	/** @type {import('svelte').Fork | null} */
	let f = null;

	$effect(() => {
		console.log(`effect: ${count}`);

		return () => {
			console.log(`teardown: ${count}`);
		};
	});
</script>

<button onclick={() => (f = fork(() => count++))}>fork</button>
<button onclick={() => f?.commit()}>commit</button>

<p>{count}</p>
