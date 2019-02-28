<script>
	import marked from 'marked';

	let markdown = `Some words are *italic*, some are **bold**`;
	$: rendered = marked(markdown);
</script>

<style>
	textarea { width: 100%; height: 200px; }
</style>

<textarea value={markdown}></textarea>

{@html rendered}