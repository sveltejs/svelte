<script>
	import { fork } from 'svelte';

	let input;
	let b = $state(0);
	let current_fork;
	export const registry = [];

	function f(value) {
		return new Promise((resolve, reject) =>
			registry.push(() => (value < 0 ? reject(value) : resolve(value)))
		);
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
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
	{#await f(b) then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}
</div>
