<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let outer = $state(false);
	let inner = $state(false);
	let navigating = $state(false);
	let f;

	const deferred = [];

	function load() {
		console.log('load');
		return new Promise((resolve) => deferred.push(() => resolve(42)));
	}
</script>

<button onclick={() => (f = fork(() => { outer = true; inner = true; }))}>preload</button>
<button onclick={() => (outer = true)}>reveal outer</button>
<button onclick={() => { outer = true; navigating = true; }}>reveal and navigate</button>
<button onclick={() => (navigating = !navigating)}>navigate</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => { outer = false; inner = false; navigating = false; }}>reset</button>

{#if outer}
	<section>
		{#if inner}
			<svelte:boundary onerror={(error) => console.log(error.message)}>
				{#snippet pending()}loading{/snippet}
				<Child total={await load()} {navigating} />
			</svelte:boundary>
		{/if}
	</section>
{/if}
