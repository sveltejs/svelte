<script>
	import { SvelteMap } from 'svelte/reactivity';

	let visibleExternal = $state(false);
	let external = new SvelteMap();
	const throws = $derived.by(() => {
		external.set(1, 1);
		return external;
	});

	let visibleInternal = $state(false);
	const works = $derived.by(() => {
		let internal = new SvelteMap();
		internal.set(1, 1);
		return internal;
	});
</script>

<button onclick={() => (visibleExternal = true)}>external</button>
{#if visibleExternal}
	{throws}
{/if}
<button onclick={() => (visibleInternal = true)}>internal</button>
{#if visibleInternal}
	{works}
{/if}

