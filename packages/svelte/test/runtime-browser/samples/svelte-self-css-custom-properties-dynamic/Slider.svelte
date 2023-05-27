<script>
  export let id;
	export let count = 0;
	export let railColor1;
	export let trackColor1;
</script>

<div {id}>
  <p>Slider</p>
  <span>Track</span>
</div>

{#if count === 0}
	<svelte:self
		id="nest-{id}"
		count="{count + 1}"
		--rail-color={railColor1}
		--track-color={trackColor1}
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
