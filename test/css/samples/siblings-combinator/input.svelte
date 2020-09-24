<style>
	div + article {
		color: green;
	}
	article + div {
		color: green;
	}
	span + article {
		color: green;
	}
	b + article {
		color: green;
	}
	span + div {
		color: green;
	}
	span + b {
		color: green;
	}
	div span + b {
		color: green;
	}
	.a + article {
		color: green;
	}
	div + .b {
		color: green;
	}
</style>

<div class="a">
	<span />
	<b />
</div>
<article class="b"></article>