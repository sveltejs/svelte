<ul>
	<li>a</li>
	<li class="important">b</li>
</ul>

<style>
	/* the `a` of `an+b`, and a lone `<integer>`, can be negative, and `n` is case-insensitive */
	li:nth-child(-1) {
		color: red;
	}
	li:nth-child(-2n) {
		color: green;
	}
	li:nth-child(-2n-1) {
		color: blue;
	}
	li:nth-child(2N+1) {
		color: yellow;
	}
	li:nth-child(-2n-1 of .important) {
		color: purple;
	}
</style>
