<script module>
	export { outer };
</script>

{#snippet outer()}
	<p class="inner"></p>
{/snippet}

<style>
	.inner {
		color: red;
	}
</style>
