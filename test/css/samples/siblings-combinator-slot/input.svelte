<script>
	let App;
</script>

<style>
	.d + .e { color: green; }
	
	/* no match */
	.a + .b { color: green; }
	.b + .c { color: green; }
	.c + .f { color: green; }
</style>

<div class="a" />
<App>
	<div class="b" slot="a" />

	<div class="c" slot="b">
		<div class="d" />
		<div class="e" />
	</div>
</App>

<div class="f" />