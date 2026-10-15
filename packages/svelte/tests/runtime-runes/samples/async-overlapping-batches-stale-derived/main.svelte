<script>
	import Async from './Async.svelte';

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let sum = $derived(a + b);
	const registry = [];

	export const log = [];

	$effect(() => {
		log.push(sum);
	});

	function f(tag, value) {
		return new Promise((resolve) => registry.push(() => resolve(`${tag}${value}`)));
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

<button onclick={resolve_all}>resolve all</button>
<button onclick={() => (b = 1)}>b = 1</button>
<button onclick={() => (b = 0)}>b = 0</button>

<div id="output">
	<svelte:boundary>
		<Async {a} {b} {c} {sum} {f} />
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</div>
