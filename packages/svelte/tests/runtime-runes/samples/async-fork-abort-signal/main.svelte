<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let id = $state(1);
	let show = $state(true);
	/** @type {any} */
	let current_fork = null;

	function run_fork() {
		current_fork = fork(() => {
			id = 2;
		});
	}
</script>

<button onclick={run_fork}>fork</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => (show = false)}>unmount</button>

{#if show}
	<Child {id} />
{/if}
