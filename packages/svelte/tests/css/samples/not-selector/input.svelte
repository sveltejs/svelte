<p class="foo">foo</p>
<p class="bar">
	bar
	<span>baz</span>
</p>
<span>buzz</span>

<style>
	:not(.foo) {
		color: green;
	}
	:not(.unused) {
		color: green;
	}
	:not(p) {
		color: green;
	}

	:not(.foo):not(.unused) {
		color: green;
	}

	p:not(.foo) {
		color: green;
	}
	span :not(.foo) {
		color: red;
	}
	span :not(.unused) {
		color: red;
	}

	span:not(p span) {
		color: green;
	}
	span:not(:focus) {
		color: green;
	}

	p:not(:has(span)) {
		color: green;
	}
</style>