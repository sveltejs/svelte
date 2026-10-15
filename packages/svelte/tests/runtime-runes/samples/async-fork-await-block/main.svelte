<script>
	import { fork } from 'svelte';

	let input;
	let b = $state(0);
	let current_fork;
	const queued = [];

	function push(value) {
		console.log(value);
		return new Promise((resolve, reject) =>
			queued.push(() => (value < 0 ? reject(value) : resolve(value)))
		);
	}

	function resolve_all() {
		for (const r of queued.splice(0)) r();
	}

	function update() {
		b = +input.value;
	}
</script>

<input bind:this={input}>
<button onclick={update}>set b</button>
<button onclick={() => (current_fork = fork(update))}>set b (fork)</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>

<div id="output">
	{#await push(b) then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}
</div>
