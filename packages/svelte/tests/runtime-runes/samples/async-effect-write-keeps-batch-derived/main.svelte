<script>
	import { untrack } from 'svelte';

	let x = $state(0);
	let t = $state(0);
	let s = $state(0);

	// `s` changes, but `big` doesn't
	let big = $derived(s > 100);
	let label = $derived(`${big}-${t}`);

	const queue = [];
	function push(v) {
		if (!v) return v;
		return new Promise((r) => queue.push(() => r(v)));
	}

	$effect.pre(() => {
		if (x) untrack(() => s++);
	});
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => t++}>t</button>
<button onclick={() => queue.shift()()}>shift</button>

<p>{await push(x)}</p>
<p>{await push(t)}</p>
<!-- evaluates `label` during traversal of B -->
{#key label}{/key}

<p>{x} {label}</p>
