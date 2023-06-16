<script>
	import { Section } from '@sveltejs/site-kit/components';
	import { TryTerminal } from '@sveltejs/site-kit/components';
</script>

<div class="try-container">
	<Section --background="var(--background-2)">
		<div class="grid" style="--columns: 2">
			<div class="try">
				<TryTerminal />
			</div>
			<div class="copy">
				<h2>see for yourself</h2>
				<div>
					Try it locally, <a target="_blank" rel="noreferrer" href="https://sveltekit.new">on StackBlitz</a>, or<br />
					with <a target="_blank" href="https://learn.svelte.dev">the interactive tutorial</a>.
				</div>
			</div>
		</div>
	</Section>
</div>

<style>
	.try-container {
		--background-2: var(--sk-back-4);
	}

	:global(body.dark .try-container) {
		--background-2: #444;
	}

	@media (prefers-color-scheme: dark) {
		.try-container {
			--background-2: #444;
		}

		:global(body.light .try-container) {
			--background-2: var(--sk-back-4) !important;
		}
	}

	.grid {
		display: grid;
		gap: 1em;
		margin: 0 0 4rem 0;
	}

	.grid:last-child {
		margin-bottom: 0;
	}

	@media (min-width: 900px) {
		.grid {
			grid-template-columns: repeat(var(--columns), 1fr);
			gap: 7rem;
		}
	}

	.try {
		width: 100%;
		margin: 0 auto;
		font-size: var(--sk-text-m);
		color: var(--sk-text-1);
	}

	.copy {
		text-align: center;
		margin: 0 0 8rem;
	}

	h2 {
		display: inline-block;
		width: 25rem;
		margin: 4rem 0 1rem;
		font-size: var(--sk-text-xl);
		text-align: justify;
	}

	a {
		color: inherit;
		text-decoration: underline;
	}
</style>
