<div>text</div>
<div class='foo'>text<span>text</span></div>
<span>text</span>

<style>
	div:global(.bar) {
		color: red;
	}

	.foo:global(.bar) {
		color: red;
	}

	.foo:global(.bar) span {
		color: red;
	}

	.bar:global(.foo) {
		color: blue;
	}
</style>