<script>
	export let unknown1 = 'root';
	export let unknown2 = 'whatever';
</script>

<style>
	:global(html) :global(body) .root p {
		color: red;
	}
</style>

<div class={unknown1}>
	<section class={unknown2}>
		<p>hello</p>
	</section>
</div>
