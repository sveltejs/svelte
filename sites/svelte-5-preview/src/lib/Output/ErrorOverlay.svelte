<script>
	/** @type {import('svelte/compiler').CompileError} */
	export let error;
</script>

<div class="error-overlay">
	<div class="error">
		<h2>Error compiling {error.filename ?? 'component'}</h2>
		<pre><code>{error.message}</code></pre>

		{#if error.start}
			<small>line {error.start.line} column {error.start.column}</small>
		{/if}
	</div>
</div>

<style>
	.error-overlay {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		padding: 1em;
		background: rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(5px);
	}

	.error {
		display: flex;
		flex-direction: column;
		gap: 1em;
		background: var(--sk-back-1);
		padding: 1em;
		border-top: 4px solid var(--sk-theme-1);
		border-radius: 4px;
		filter: drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.1));
	}

	pre {
		padding: 0.5em;
		background: var(--sk-back-3);
	}

	small {
		color: var(--sk-text-4);
	}
</style>
