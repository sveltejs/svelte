<script>
	import { createRawSnippet } from 'svelte';

	let show = $state(true);

	const snippet = createRawSnippet(() => ({
		render: () => `<hr>`,
		setup(p) {
			return () => console.log('tearing down')
		}
	}));
</script>

<button onclick={() => show = !show}>click</button>

{#if show}
	{@render snippet()}
{/if}
