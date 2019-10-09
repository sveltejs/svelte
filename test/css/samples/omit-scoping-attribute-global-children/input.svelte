<script>
	export let unknown1 = 'root';
	export let unknown2 = 'whatever';
</script>

<style>
	.root :global(p) {
		color: red;
	}
</style>

<div class={unknown1}>
	<section class={unknown2}>
		<!-- injected somehow -->
	</section>
</div>
