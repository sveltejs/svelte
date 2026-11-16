<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';
	let show = $state(false);
	let speculative: Fork;
	let request: PromiseWithResolvers<number>;
	function load() {
		console.log('load');
		request = Promise.withResolvers<number>();
		return request.promise;
	}
</script>

<button onclick={() => speculative = fork(() => { show = true; })}>fork</button>
<button onclick={() => speculative.commit().then(() => console.log('committed'), () => console.log('unexpected rejection'))}>commit</button>
<button onclick={() => request.resolve(42)}>resolve</button>
<button onclick={() => show = false}>hide</button>
<button onclick={() => request.reject(new Error('later failure'))}>reject</button>
<output>
	{#if show}
		<svelte:boundary onerror={() => console.log('handled after commit')}>
			<Child {load} />
			{#snippet pending()}<p>pending</p>{/snippet}
			{#snippet failed()}<p>failed</p>{/snippet}
		</svelte:boundary>
	{/if}
</output>
