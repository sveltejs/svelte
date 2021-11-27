<script>
	import { marked } from 'marked';
	let value = `Some words are *italic*, some are **bold**`;
</script>

{@html marked(value)}

<textarea value={value}></textarea>

<style>
	textarea { width: 100%; height: 200px; }
</style>
