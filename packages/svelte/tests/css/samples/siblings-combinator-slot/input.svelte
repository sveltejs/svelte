<script>
	let App;
</script>

<style>
	.d + .e { color: green; }
	.a + .b { color: green; }
	.c + .f { color: green; }

	/* no match */
	.b + .c { color: red; }
</style>

<div class="a"></div>
<App>
	<div class="b" slot="a"></div>

	<div class="c" slot="b">
		<div class="d"></div>
		<div class="e"></div>
	</div>
</App>

<div class="f"></div>
