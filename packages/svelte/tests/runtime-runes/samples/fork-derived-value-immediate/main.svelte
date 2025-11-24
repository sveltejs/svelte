<script>
	import { fork } from "svelte";

	let state = $state(0);
	let count = $derived(state);
</script>

<button onclick={() => {
	fork(() => {
		state++;
		console.log(count);
		state++;
		console.log(count);
	});
}}>fork</button>
