<script>
	let array = [1];
</script>

<style>
	div + span {
		color: green;
	}
</style>

<div />

{#each array as item}
	<span class="each" />
	<div class="each" />
	<span class="each" />
	<div class="each" />
{/each}

<span />