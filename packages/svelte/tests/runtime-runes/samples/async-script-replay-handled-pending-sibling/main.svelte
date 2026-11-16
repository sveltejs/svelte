<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	import Waiting from './Waiting.svelte';
	let show = $state(false);
	let speculative: Fork;
	const failure = new Error('cached failure');
	const request = Promise.withResolvers<number>();
	function load() { return request.promise; }
	function wait(signal: AbortSignal) {
		signal.addEventListener('abort', () => console.log('cancelled sibling'));
		return new Promise<void>(() => {});
	}
</script>
<button onclick={() => speculative = fork(() => { show = true; })}>fork</button>
<button onclick={() => request.reject(failure)}>reject</button>
<button onclick={() => speculative.commit().then(() => console.log('committed'), () => console.log('unexpected rejection'))}>commit</button>
<output>
	<svelte:boundary onerror={(error) => console.log(error === failure ? 'original error' : 'unexpected error')}>
		{#if show}<Child {load} /><Waiting {wait} />{/if}
		{#snippet failed()}<p>failed</p>{/snippet}
	</svelte:boundary>
</output>
