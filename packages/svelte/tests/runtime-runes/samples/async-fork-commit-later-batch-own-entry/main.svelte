<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);

	/** @type {ReturnType<typeof fork> | null} */
	let f = null;

	/** @type {Array<(value: string) => void>} */
	const p_queue = [];

	/** @type {Array<() => void>} */
	const b_queue = [];

	/** @param {number} a */
	function get_p(a) {
		return new Promise((resolve) => p_queue.push(resolve));
	}

	/** @param {number} b */
	function get_b(b) {
		return new Promise((resolve) => b_queue.push(() => resolve('b' + b)));
	}

	/** @param {string} v */
	function resolve_p(v) {
		p_queue.shift()?.(v);
	}
</script>

<button onclick={() => (f = fork(() => (a = 1)))}>fork</button>
<button onclick={() => ((a = 2), (b = 1))}>a = 2, b = 1</button>
<button onclick={() => resolve_p('F')}>p = F</button>
<button onclick={() => resolve_p('A')}>p = A</button>
<button onclick={() => b_queue.shift()?.()}>resolve b</button>
<button onclick={() => f?.commit()}>commit</button>

<svelte:boundary>
	<p>{await get_p(a)}</p>
	<i>{await get_b(b)}</i>
	<span>{a}|{b}</span>

	{#snippet pending()}{/snippet}
</svelte:boundary>
