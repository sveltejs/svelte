<script>
	export let visible = true;
	let h1;
</script>

<div>The text is {h1 ? h1.textContent : 'missing'}</div>
{#if visible}
	<h1 bind:this={h1}>hello</h1>
{/if}
