<script>
	import marked from 'marked';

	let markdown = `# Markdown editor\n\nTODOs:\n\n* make a Svelte app\n* think of a third item for this list`;
</script>

<style>
	textarea {
		width: 100%;
		height: 50%;
	}
</style>

<textarea bind:value={markdown} resize="none"></textarea>
<div class="output">{@html marked(markdown)}</div>