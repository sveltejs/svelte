<style>
	div ~ article { color: green; }
	span ~ b { color: green; }
	div span ~ b { color: green; }
	.a ~ article { color: green; }
	div ~ .b { color: green; }
	.a ~ .c { color: green; }
	article ~ details { color: green; }
	.a ~ details { color: green; }

	/* no match */
	article ~ div { color: green; }
	span ~ article { color: green; }
	b ~ article { color: green; }
	span ~ div { color: green; }
</style>

<div class="a">
	<span />
	<b />
</div>
<article class="b"></article>
<p class="c"></p>
<details class="d"></details>