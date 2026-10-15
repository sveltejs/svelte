<script>
	import { fork } from 'svelte';

	let sharedState = $state(0);
	let show = $state(false);
	let f;
	let calls = 0;

	const resolvers = [];

	// Only evaluated in the fork, with a fresh object on each evaluation.
	const searchParams = $derived({ value: sharedState });

	export function get_calls() {
		return calls;
	}

	function load(value) {
		calls += 1;
		return new Promise((resolve) => resolvers.push(() => resolve(value)));
	}
</script>

<button
	onclick={() => {
		f = fork(() => {
			sharedState = 1;
			show = true;
		});
	}}
	>fork</button
>
<button onclick={() => sharedState++}>update</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>
<button onclick={() => f?.discard()}>discard</button>

{#if show}
	<svelte:boundary>
		{#snippet pending()}loading{/snippet}
		<p>{await load(searchParams.value)}</p>
	</svelte:boundary>
{/if}
