<script>
	import { SvelteSet } from 'svelte/reactivity';

	let visibleExternal = $state(false);
	let external = new SvelteSet();
	const throws = $derived.by(() => {
		external.add(1);
		return external;
	})

	let visibleInternal = $state(false);
	const works = $derived.by(() => {
		let internal = new SvelteSet();
		internal.add(1);
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

