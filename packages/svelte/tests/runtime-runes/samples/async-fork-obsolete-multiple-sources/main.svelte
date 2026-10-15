<script>
	import { fork } from 'svelte';

	let x = $state(0);
	let y = $state(0);
	let z = $state(0);
	let f;

	function load(x, y, z) {
		console.log(`${x}/${y}/${z}`);
		return x + y + z;
	}

	function speculate() {
		f = fork(() => { x = 1; y = 1; });
	}

	function catch_up() {
		x = 1;
		y = 1;
	}

	function update() {
		z = 1;
	}

	function discard() {
		f.discard();
	}

	async function commit() {
		await f.commit();
		console.log('committed');
	}
</script>

<button onclick={speculate}>fork x = y = 1</button>
<button onclick={catch_up}>set x = y = 1</button>
<button onclick={update}>set z = 1</button>
<button onclick={commit}>commit fork</button>
<button onclick={discard}>discard fork</button>

<p>{await load(x, y, z)}</p>
