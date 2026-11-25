<script>
	export let clientWidth;
	export let clientHeight;
	export let offsetWidth;
	export let offsetHeight;
</script>

<div bind:clientWidth bind:clientHeight bind:offsetWidth bind:offsetHeight>
	<section></section>
</div>

<style>
	div {
		width: 100px;
		height: 100px;
		overflow: hidden;
		scrollbar-gutter: stable;
		padding: 10px;
		border: 2px solid;
	}
	div::-webkit-scrollbar {
		width: 15px;
		height: 15px;
	}
	section {
		width: 20px;
		height: 20px;
	}
</style>
