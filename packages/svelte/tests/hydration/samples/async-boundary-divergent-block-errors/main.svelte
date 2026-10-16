<script>
	import Throw from './Throw.svelte';
	let { browser } = $props();
	const Component = $derived(browser ? Throw : null);
	let broken = $state(true);
</script>

{#snippet failed()}<p>failed</p>{/snippet}

<svelte:boundary {failed}>
	{#each browser ? [1] : [] as item}{JSON.parse('')}{/each}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	{#each browser ? [false, true] : [false] as item}
		{item ? JSON.parse('') : 'server'}
	{/each}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	{#each browser ? [] : [1] as item}
		server
	{:else}
		{JSON.parse('')}
	{/each}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	{#await browser ? null : Promise.resolve()}
		pending
	{:then}
		{JSON.parse('')}
	{/await}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	<Component />
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	{#if browser}
		<svelte:boundary>{JSON.parse('')}</svelte:boundary>
	{/if}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	{#if browser}
		<svelte:boundary {failed}>{JSON.parse('')}</svelte:boundary>
	{/if}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary {failed}>
	{browser ? JSON.parse('') : 'server'}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary onerror={() => {}}>
	{#if browser}{JSON.parse('')}{/if}
</svelte:boundary>
<p class="after">{browser}</p>

<svelte:boundary>
	{#if browser}
		<p class="recovered">{broken ? JSON.parse('') : 'recovered'}</p>
	{:else}
		<p>server</p>
	{/if}
	{#snippet failed(error, reset)}
		<button class="reset" onclick={() => { broken = false; reset(); }}>reset</button>
	{/snippet}
</svelte:boundary>
<p class="after">{browser}</p>

<button onclick={(event) => event.currentTarget.textContent = 'clicked'}>log</button>
