<script>
	import { marked } from 'marked';
	let text = `Some words are *italic*, some are **bold**`;
</script>

<textarea bind:value={text}></textarea>

{@html marked(text)}

<style>
	textarea { width: 100%; height: 200px; }
</style>
