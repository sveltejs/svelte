<script>
	import { fork } from 'svelte';

	let input;
	let a = $state(0);
	let b = $state(0);
	let current_fork;

	/** @type {Map<number, Array<() => void>>} */
	const registry = new Map();

	function f(value) {
		return new Promise((resolve, reject) => {
			if (!registry.has(value)) registry.set(value, []);
			registry.get(value).push(() => (value < 0 ? reject(value) : resolve(value)));
		});
	}

	/** resolve the promises created for `value` */
	function settle(value) {
		for (const r of registry.get(value) ?? []) r();
		registry.delete(value);
	}

	function update_b() {
		b = +input.value;
	}
</script>

<input bind:this={input}>
<button onclick={() => (a = +input.value)}>set a</button>
<button onclick={update_b}>set b</button>
<button onclick={() => (current_fork = fork(update_b))}>set b (fork)</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>
<button onclick={() => settle(+input.value)}>resolve</button>

<div id="output">
	{#await f(a + b)}<i>pending</i>{:then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}
</div>
