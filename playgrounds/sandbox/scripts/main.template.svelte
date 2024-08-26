<script lang="ts">
	function openInEditor() {
		fetch('./__open-in-editor?file=src/main.svelte');
	}
</script>

<h1>Demo App</h1>
<button class="open-in-editor" on:click={openInEditor}>edit main.svelte</button>
