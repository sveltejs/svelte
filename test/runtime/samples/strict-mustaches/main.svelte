<script>
	export let text;
	export let container = null;
</script>

<div bind:this={container}>
	before{@strict text}after
</div>
