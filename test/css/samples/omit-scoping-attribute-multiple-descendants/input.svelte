<script>
	export let unknown = 'whatever';
</script>

<div class='root'>
	<section class='{unknown}'>
		<p>hello</p>
	</section>
</div>

<style>
	.root p {
		color: red;
	}
</style>
