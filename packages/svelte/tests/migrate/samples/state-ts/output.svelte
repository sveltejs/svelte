<script lang="ts">
	// here is a comment
	let div: HTMLIFrameElement;
	let count = $state(0);
</script>

<div bind:this={div}></div>
<button onclick={() => count++}>{count}</button>
