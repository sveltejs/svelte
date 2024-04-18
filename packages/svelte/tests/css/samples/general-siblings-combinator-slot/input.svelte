<script>
	let App;
</script>

<style>
	.d ~ .e { color: green; }
	.a ~ .g { color: green; }

	/* no match */
	.a ~ .b { color: green; }
	.b ~ .c { color: green; }
	.c ~ .f { color: green; }
	.f ~ .g { color: green; }
	.b ~ .f { color: green; }
	.b ~ .g { color: green; }
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
