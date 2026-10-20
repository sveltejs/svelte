<script>
	import { fork } from 'svelte';

	let input;
	let a = $state(0);
	let b = $state(0);
	let current_fork;

	/** @type {Map<string, Array<() => void>>} */
	const registry = new Map();

	function f(tag, value) {
		return new Promise((resolve) => {
			const key = tag + value;
			if (!registry.has(key)) registry.set(key, []);
			registry.get(key).push(() => resolve(value));
		});
	}

	/** resolve the promises created for `tag` and `value` */
	function settle(tag, value) {
		for (const r of registry.get(tag + value) ?? []) r();
		registry.delete(tag + value);
	}

	function update_b() {
		b = +input.value;
	}
</script>

<input bind:this={input}>
<button onclick={() => (a = +input.value)}>set a</button>
<button onclick={() => (current_fork = fork(update_b))}>set b (fork)</button>
<button onclick={() => current_fork?.commit()}>commit</button>
<button onclick={() => settle('p', +input.value)}>resolve p</button>
<button onclick={() => settle('aw', +input.value)}>resolve aw</button>

<div id="output">
	<svelte:boundary>
		<p>{await f('p', b)}</p>
		{#await f('aw', a + b)}<i>pending</i>{:then v}<q>{v}</q>{/await}
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</div>
