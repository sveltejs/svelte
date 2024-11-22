<script>
	let App;
</script>

<style>
	.d + .e { color: green; }
	.a + .b { color: green; }
	.a + .c { color: green; }
	.a + .f { color: green; }
	.b + .c { color: green; }
	.c + .b { color: green; }
	.c + .f { color: green; }

	/* no match */
	.a + .d { color: red; }
	.d + .f { color: red; }
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
