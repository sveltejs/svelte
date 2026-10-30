<div class="a">
	<p class="b">x</p>
</div>

<style>
	div /* comment */ p {
		color: red;
	}

	div > /* comment */ .b {
		color: green;
	}

	div /* comment */ > p {
		color: blue;
	}

	div/* comment */.a {
		color: yellow;
	}

	:is(div /* comment */ .b) {
		color: purple;
	}
</style>
