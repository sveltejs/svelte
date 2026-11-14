<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let navigating = $state(false);
	let f;
</script>

<button onclick={() => (f = fork(() => (show = true)))}>preload</button>
<button onclick={() => (navigating = !navigating)}>navigate</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => f.discard()}>discard</button>

{#if show}
	<svelte:boundary onerror={(error) => console.log(error.message)}>
		{#snippet pending()}loading{/snippet}
		<Child total={await Promise.resolve(42)} {navigating} />
	</svelte:boundary>
{/if}
