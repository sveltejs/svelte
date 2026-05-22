<script>
	import { fork } from 'svelte';
	let show = $state(false);
	let f;
</script>

<button onclick={() => f = fork(() => show = true)}>show</button>
<button onclick={() => f.commit()}>commit</button>
<button onclick={() => f.discard()}>discard</button>

<svelte:boundary>
	{#if show}
		{await Promise.reject('boom')}
	{/if}
	{#snippet failed()}
		failed
	{/snippet}
</svelte:boundary>