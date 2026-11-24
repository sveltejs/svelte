<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let speculative: Fork | undefined;
	const pending = Promise.withResolvers<void>();

	function finish() {
		speculative?.discard();
	}
</script>

<button onclick={() => (speculative = fork(() => (show = true)))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => pending.resolve()}>resolve</button>

<output>
	{#if show}
		<Child wait={pending.promise} {finish} />
	{/if}
</output>
