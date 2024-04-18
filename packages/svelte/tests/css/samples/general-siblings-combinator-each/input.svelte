<script>
	let array = [1];
</script>

<style>
	div ~ span {
		color: green;
	}
</style>

<div></div>

{#each array as item}
	<span class="each"></span>
	<div class="each"></div>
	<span class="each"></span>
	<div class="each"></div>
{/each}

<span></span>
