<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let f;

	const queue = [];

	function push(v) {
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => queue.shift()?.()}>shift</button>
<button onclick={() => f.commit()}>commit</button>

{#if show}
	<Child {push} />
{/if}
