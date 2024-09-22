<script lang="ts">
	// here is a comment
	let div: HTMLIFrameElement = $state();
	let count = $state(0);
</script>

<div bind:this={div}></div>
<button onclick={() => count++}>{count}</button>