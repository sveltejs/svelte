<script>
	import { fork } from 'svelte';

	let list = $state([0]);
	const queued = [];
	let current_fork;

	function push(value) {
		console.log(value);
		return new Promise((resolve) => queued.push(() => resolve(value)));
	}

	function resolve_all() {
		for (const r of queued.splice(0)) r();
	}
</script>

<button onclick={() => (current_fork = fork(() => (list = [])))}>fork empty</button>
<button onclick={() => (list = [])}>empty</button>
<button onclick={() => (list = [0])}>reset</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>

<main>{#each list as x (x)}<b>{x}</b>{:else}<p>{await push('empty')}</p>{/each}</main>
