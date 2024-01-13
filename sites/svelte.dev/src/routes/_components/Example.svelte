<script>
	import IntersectionObserver from '$lib/components/IntersectionObserver.svelte';
	import { process_example } from '$lib/utils/examples';
	import Repl from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';

	export let id;

	/** @type {import('@sveltejs/repl').default} */
	let repl;

	$: {
		if (repl) {
			fetch(`/examples/api/${id}.json`)
				.then((r) => r.json())
				.then((data) => process_example(data.files))
				.then((files) => {
					repl.set({
						files
					});
				});
		}
	}
</script>

<div class="repl-container">
	<IntersectionObserver once let:intersecting top={400}>
		{#if intersecting}
			<Repl
				bind:this={repl}
				svelteUrl="https://unpkg.com/svelte@4"
				relaxed
				showAst
				previewTheme={$theme.current}
			/>
		{/if}
	</IntersectionObserver>
</div>

<style>
	.repl-container {
		width: 100%;
		height: 420px;
		border-radius: var(--sk-border-radius);
		overflow: hidden;
	}
</style>
