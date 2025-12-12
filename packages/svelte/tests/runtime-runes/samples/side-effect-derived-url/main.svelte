<script>
	import { SvelteURL } from 'svelte/reactivity';

	let visibleExternal = $state(false);
	let external = new SvelteURL('https://svelte.dev');
	const throws = $derived.by(() => {
		external.host = 'kit.svelte.dev'
		return external;
	})

	let visibleInternal = $state(false);
	const works = $derived.by(() => {
		let internal = new SvelteURL('https://svelte.dev');
		internal.host = 'kit.svelte.dev'
		return internal;
	})
</script>

<button onclick={() => (visibleExternal = true)}>external</button>
{#if visibleExternal}
	{throws}
{/if}
<button onclick={() => (visibleInternal = true)}>internal</button>
{#if visibleInternal}
	{works}
{/if}

