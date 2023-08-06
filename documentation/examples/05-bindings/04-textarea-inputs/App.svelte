<script>
	import { marked } from 'marked';
	let value = `Certains mots sont en *italique*, d'autres sont en **gras**`;
</script>

{@html marked(value)}

<textarea bind:value />

<style>
	textarea {
		width: 100%;
		height: 200px;
	}
</style>
