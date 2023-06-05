<script>
	import { Section } from '@sveltejs/site-kit/components';
	import { TryTerminal } from '@sveltejs/site-kit/components';
</script>

<div class="try-container">
	<Section --background="var(--background-2)">
		<div class="grid" style="--columns: 2">
			<div class="copy">
				<h2>Starting is simple</h2>
				<p>Get started with just a few lines</p>
				<div>
					<a class="btn secondary-cta" target="_blank" href="https://learn.svelte.dev">Or try the online tutorial</a>
				</div>
			</div>
			<div class="try">
				<TryTerminal />
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
		margin-top: 2rem;
		font-size: var(--sk-text-xl);
	}

	.btn {
		display: inline-block;
		padding: 1rem 2rem;
		text-decoration: none;
		line-height: 1;
		vertical-align: middle;
		border-radius: var(--sk-border-radius);
	}

	.secondary-cta {
		border: 2px var(--sk-text-4) solid;
	}

	a {
		color: inherit;
		text-decoration: underline;
	}
</style>
