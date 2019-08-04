<script>
	import { Section } from '@sveltejs/site-kit';
	import IntersectionObserver from '../../components/IntersectionObserver.svelte';
	import ReplWidget from '../../components/Repl/ReplWidget.svelte';

	export let id;
</script>

<style>
	.example {
		width: 100%;
	}

	.example :global(a) {
		color: inherit;
	}

	.example > :global(p) {
		margin: 4.4rem 2.4rem 2.4rem 0;
	}

	.repl-container {
		width: 100%;
		height: 420px;
		border-radius: var(--border-r);
		overflow: hidden;
	}

	@media (min-width: 920px) {
		.example {
			display: grid;
			grid-template-columns: 1fr 3fr;
			grid-gap: 0.5em;
			align-items: start;
		}
	}
</style>

<Section>
	<div class="example">
		<slot></slot>

		<div class="repl-container">
			<IntersectionObserver once let:intersecting top={400}>
				{#if intersecting}
					<!-- <Lazy this={loadReplWidget} example={id}/> -->
					<ReplWidget example={id}/>
				{/if}
			</IntersectionObserver>
		</div>
	</div>
</Section>