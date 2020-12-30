<script>
	import marked from 'marked';
	let value = `Some words are *italic*, some are **bold**`;
</script>

<style>
	textarea { width: 100%; height: 100px; }
</style>

{@html marked(value)}
<textarea bind:value></textarea>

