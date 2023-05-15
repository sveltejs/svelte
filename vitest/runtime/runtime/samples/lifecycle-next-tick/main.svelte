<script>
	import { tick } from 'svelte';

	export let snapshots = [];

	let count = 0;
	let buttons = [];

	function increment() {
		count += 1;
		log();
	}

	function log() {
		snapshots.push(`before ${buttons[0].textContent}`);

		tick().then(() => {
			snapshots.push(`after ${buttons[0].textContent}`);
		});
	}
</script>

<button bind:this={buttons[0]} on:click={increment}>{count}</button>
<button bind:this={buttons[1]} on:click={log}>{count}</button>