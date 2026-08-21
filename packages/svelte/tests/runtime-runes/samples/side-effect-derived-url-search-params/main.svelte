<script>
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let visibleExternal = $state(false);
	let external = new SvelteURLSearchParams();
	const throws = $derived.by(() => {
		external.append('foo', 'bar')
		return external;
	})

	let visibleInternal = $state(false);
	const works = $derived.by(() => {
		let internal = new SvelteURLSearchParams();
		internal.append('foo', 'bar')
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

