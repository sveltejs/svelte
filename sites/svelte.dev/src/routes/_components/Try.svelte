<script>
	import { Section } from '@sveltejs/site-kit/components';
	import { TryTerminal } from '@sveltejs/site-kit/components';
</script>

<div class="try-container">
	<Section --background="var(--background-2)">
		<div class="copy">
			<h2>Starting is Simple</h2>
			<p>Get started with just the few lines below.</p>
			<div>
				<a class="btn main-cta" href="/docs">Learn More ↗</a>
				<a class="btn secondary-cta" target="_blank" rel="noreferrer" href="https://sveltekit.new">Create with StackBlitz</a>
			</div>
		</div>
		<div class="try">
			<TryTerminal />
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

	.try {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		font-size: var(--sk-text-m);
		color: var(--sk-text-1);
	}

	.copy {
		text-align: center;
		margin: 0 0 8rem;
	}

	h2 {
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

	.main-cta {
		color: white;
		background: var(--sk-theme-1);
		border: 2px var(--sk-theme-1) solid;
		font-weight: 600;
	}

	.secondary-cta {
		border: 2px #cdc8cf solid;
	}

	a {
		color: inherit;
		text-decoration: underline;
	}
</style>
