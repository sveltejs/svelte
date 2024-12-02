<script lang="ts">
	// here is a comment
	let div: HTMLIFrameElement;
	let count = 0;
</script>

<div bind:this={div}></div>
<button on:click={() => count++}>{count}</button>
