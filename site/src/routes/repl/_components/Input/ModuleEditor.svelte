<script>
	import CodeMirror from '../CodeMirror.svelte';

	export let component;
	export let error;
	export let errorLoc;
	export let warningCount = 0;
</script>

<style>
	.editor-wrapper {
		z-index: 5;
		background: var(--back-light);
	}

	@media (min-width: 600px) {
		.editor-wrapper {
			/* make it easier to interact with scrollbar */
			padding-right: 8px;
			height: auto;
			/* height: 100%; */
		}
	}
</style>

<div class="editor-wrapper">
	{#if component}
		<CodeMirror
			mode="{component.type === 'js' ? 'javascript' : 'handlebars'}"
			code={component.source}
			{error}
			{errorLoc}
			{warningCount}
			on:change
			on:navigate
		/>
	{/if}
</div>