<script>
	export let id;
	export let count = 0;
</script>

<div {id}>
	<p>Slider1</p>
	<span>Track</span>
</div>

{#if count === 0}
	<svelte:self
		id="nest-{id}"
		count={1}
		--rail-color="rgb(255, 255, 0)"
		--track-color="rgb(255, 0, 255)"
	/>
{/if}

<style>
	p {
		color: var(--rail-color);
	}
	span {
		color: var(--track-color);
	}
</style>
