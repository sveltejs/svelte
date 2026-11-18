<script>
	import { fork } from 'svelte';

	let list = $state([0, 1]);
	let label = $state('a');
	let f;

	function log(x) {
		console.log(`create ${x}`);
		return x;
	}
</script>

<button onclick={() => (f = fork(() => { list = [0, 1, 2]; label = 'b'; }))}>fork</button>
<button onclick={() => (list = [0, 1, 5])}>list = [0, 1, 5]</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => (list = [0, 1, 2])}>list = [0, 1, 2]</button>

<main>{#each list as x (x)}<p>{log(x)}{label}</p>{/each}</main>
