<script>
	import marked from 'marked';
	let value = `Some words are *italic*, some are **bold** (Scroll down to see markdown output).`;
</script>

<style>
	textarea { width: 100%; height: 200px; }
</style>

<textarea value={value}></textarea>

{@html marked(value)}