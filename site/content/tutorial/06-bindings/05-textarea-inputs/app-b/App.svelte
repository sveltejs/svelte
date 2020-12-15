<script>
	import marked from 'marked';
	let value = `Some words are *italic*, some are **bold**`;
</script>

<style>
	textarea { width: 100%; height: 100px; }
</style>

<textarea bind:value></textarea>

{@html marked(value)}