<script>
	let array = [1];
</script>

<style>
	/* boundary of each */
	.a ~ .b {
		color: green;
	}
	.c ~ .d {
		color: green;
	}
	/* if array is empty */
	.a ~ .d {
		color: green;
	}
	/* if array has multiple items */
	.c ~ .b {
		color: green;
	}
	/* normal sibling */
	.b ~ .c {
		color: green;
	}
	.a ~ .c {
		color: green;
	}
</style>

<div class="a"></div>

{#each array as item}
	<div class="b"></div>
	<div class="c"></div>
{/each}

<div class="d"></div>
