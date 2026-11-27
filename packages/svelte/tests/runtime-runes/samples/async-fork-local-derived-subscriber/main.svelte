<script>
	import { fork } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	let id = $state(1);
	let show = $state(true);
	/** @type {any} */
	let current_fork = null;

	function make_subscriber(label) {
		return createSubscriber(() => {
			console.log('start', label);
			return () => console.log('stop', label);
		});
	}

	function render_with_local_derived(n) {
		const sub = make_subscriber(n);
		const outer = $derived.by(() => {
			const inner = $derived.by(() => {
				sub();
				return n;
			});
			return inner;
		});
		return outer;
	}

	function run_fork() {
		current_fork = fork(() => {
			id = 2;
		});
	}
</script>

<button onclick={run_fork}>fork</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>
<button onclick={() => (show = false)}>hide</button>

{#if show}
	{#key render_with_local_derived(id)}
		<output>{id}</output>
	{/key}
{/if}
