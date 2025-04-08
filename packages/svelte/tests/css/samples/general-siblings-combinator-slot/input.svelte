<script>
	let App;
</script>

<style>
	.d ~ .e { color: green; }
	.a ~ .g { color: green; }
	.a ~ .b { color: green; }
	.f ~ .g { color: green; }
	.b ~ .g { color: green; }

	/* no match */
	.b ~ .c { color: red; }
	.c ~ .f { color: red; }
	.b ~ .f { color: red; }
</style>

<div class="a"></div>
<App>
	<div class="b" slot="a"></div>

	<div class="c" slot="b">
		<div class="d"></div>
		<div class="e"></div>
	</div>

	<div class="f" slot="c"></div>
</App>

<div class="g"></div>
