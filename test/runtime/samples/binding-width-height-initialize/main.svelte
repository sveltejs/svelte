<script>
	let offsetWidth = 0;
	let offsetHeight = 0;
</script>

<div class="wrapper">
	<div class="inner" bind:offsetHeight bind:offsetWidth>
		<div class="description">width:{offsetWidth}, height:{offsetHeight}</div>
	</div>
</div>

<style>
	.wrapper {
		width: 200px;
		height: 100px;
	}

	.inner {
		width: 100%;
		height: 100%
	}
</style>
