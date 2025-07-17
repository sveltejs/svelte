<script>
	import { SvelteDate } from 'svelte/reactivity';

	let visibleExternal = $state(false);
	let external = new SvelteDate();
	const throws = $derived.by(() => {
		external.setTime(12345);
		return external;
	})

	let visibleInternal = $state(false);
	const works = $derived.by(() => {
		let internal = new SvelteDate();
		internal.setTime(12345);
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

