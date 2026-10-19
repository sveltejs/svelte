<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let other = $state(0);
	let f;
</script>

<button onclick={() => (f = fork(() => { show = true; other = 1; }))}>preload</button>
<button onclick={() => (show = true)}>reveal</button>
<button onclick={() => (show = false)}>hide</button>
<button onclick={() => f.commit()}>commit</button>

<b>{other}</b>

{#if show}
	{#if true}<p>constant</p>{/if}
	{#key 1}<p>keyed</p>{/key}
	<svelte:boundary onerror={console.error}>
		<p>boundary</p>
	</svelte:boundary>
{/if}
