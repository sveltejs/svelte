<p class="foo">foo</p>
<p class="bar">
	bar
	<span>baz</span>
</p>
<span>buzz</span>

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
		color: green;
	}
	:global(.x):not(p) {
		color: green;
	}
	:global(.x) :not(.unused) {
		color: green;
	}

	:global(span):not(p span) {
		color: green;
	}
	span:not(:global(p span)) {
		color: green;
	}
	:global(span:not(p span)) {
		color: green;
	}

	:global(.x) {
		:not(.foo) {
			color: green;
		}
		&:not(.foo) {
			color: green;
		}
	}
</style>