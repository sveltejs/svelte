<script>
	let array = [1];
</script>

<style>
	/* boundary of each */
	.a + .b {
		color: green;
	}
	.c + .d {
		color: green;
	}
	/* if array is empty */
	.a + .d {
		color: green;
	}
	/* if array has multiple items */
	.c + .b {
		color: green;
	}
	/* normal sibling */
	.b + .c {
		color: green;
	}
	/* not match */
	.a + .c {
		color: green;
	}
</style>

<div class="a" />

{#each array as item}
	<div class="b" />
	<div class="c" />
{/each}

<div class="d" />