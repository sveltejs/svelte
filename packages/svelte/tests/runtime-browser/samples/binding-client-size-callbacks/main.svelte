<script>
	export let visible = true;
	export let widths = [];
	export let heights = [];
	export let offsets = [];
	export let rect;
</script>

{#if visible}
	<div
		bind:clientWidth={null, (value) => widths.push(value)}
		bind:clientHeight={null, (value) => heights.push(value)}
		bind:offsetWidth={null, (value) => offsets.push(value)}
		bind:contentRect={rect}
	>
		<section></section>
	</div>
{/if}

<style>
	div {
		box-sizing: border-box;
		width: 140px;
		height: 140px;
		padding: 10px;
		border: 2px solid;
		overflow: hidden;
		scrollbar-gutter: stable;
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
