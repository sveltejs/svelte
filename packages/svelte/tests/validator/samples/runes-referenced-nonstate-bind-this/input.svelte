<script>
	let no_need;
	let does_need1;
	let does_need2 = $state();
</script>

<div bind:this={no_need}></div>
{#if true}
	<div bind:this={does_need1}></div>
	<div bind:this={does_need2}></div>
{/if}
