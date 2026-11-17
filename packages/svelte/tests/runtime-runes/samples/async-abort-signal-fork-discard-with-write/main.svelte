<script lang="ts">
	import { fork, getAbortSignal, type Fork } from 'svelte';

	let show = $state(false);
	let count = $state(0);
	let f: Fork;

	function load(signal: AbortSignal) {
		return new Promise<string>((resolve, reject) => {
			signal.addEventListener('abort', () => reject(signal.reason));
		});
	}
</script>

<button onclick={() => (f = fork(() => (show = true)))}>fork</button>
<button onclick={() => { count++; f.discard(); }}>discard</button>
<output><p>{count}</p></output>
{#if show}
	<span>{await load(getAbortSignal())}</span>
{/if}
