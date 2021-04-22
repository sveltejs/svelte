<script>
	import marked from 'marked';
	let value = `Some words are *italic*, some are **bold**`;
</script>

<textarea value={value}></textarea>

{@html marked(value)}

<style>
	textarea { width: 100%; height: 200px; }
</style>