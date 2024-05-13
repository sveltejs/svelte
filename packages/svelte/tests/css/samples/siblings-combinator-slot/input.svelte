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

<div class="a"></div>
<App>
	<div class="b" slot="a"></div>

	<div class="c" slot="b">
		<div class="d"></div>
		<div class="e"></div>
	</div>
</App>

<div class="f"></div>
