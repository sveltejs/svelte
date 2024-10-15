<p class="foo">foo</p>
<p class="bar">bar</p>

<style>
	:not(.foo) {
		color: green;
	}
	:not(.unused) {
		color: red;
	}
	:not(:global(.foo)) {
		color: green;
	}

	:not(.foo):not(:global(.unused)) {
		color: green;
	}
	:not(.foo):not(.unused) {
		color: red;
	}

	p:not(.foo) {
		color: green;
	}
	p :not(.foo) {
		color: red;
	}
	:global(.x):not(.foo) {
		color: green;
	}
	:global(.x):not(.unused) {
		color: red; /* TODO would be nice to prune this one day */
	}
	:global(.x) :not(.unused) {
		color: red;
	}
</style>