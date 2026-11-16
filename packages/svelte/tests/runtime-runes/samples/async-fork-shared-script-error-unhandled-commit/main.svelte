<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let speculative: Fork | undefined;
	const failure = new Error('fork failed');
	const pending = Promise.withResolvers<number>();

	function load() {
		console.log('load');
		return pending.promise;
	}

	async function commit() {
		try {
			await speculative?.commit();
			console.log('committed');
		} catch (error) {
			console.log(error === failure ? 'caught fork failure' : error);
		}
	}
</script>

<button onclick={() => (speculative = fork(() => (show = true)))}>fork</button>
<button onclick={() => pending.reject(failure)}>reject</button>
<button onclick={commit}>commit</button>

<output>
	{#if show}
		<Child {load} />
	{/if}
</output>
