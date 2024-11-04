<p class="foo">foo</p>
<p class="bar">bar</p>

<style>
	:not(:global(.foo)) {
		color: green;
	}
	:not(.foo):not(:global(.unused)) {
		color: green;
	}
	:global(.x):not(.foo) {
		color: green;
	}
	:global(.x) :not(p) {
		color: red;
	}
	:global(.x):not(p) {
		color: red; /* TODO would be nice to prune this one day */
	}
	:global(.x) :not(.unused) {
		color: green;
	}
</style>