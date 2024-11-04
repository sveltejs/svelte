<p class="foo">foo</p>
<p class="bar">bar</p>

<style>
	:not(.foo) {
		color: green;
	}
	:not(.unused) {
		color: green;
	}
	:not(p) {
		color: red;
	}

	:not(.foo):not(.unused) {
		color: green;
	}

	p:not(.foo) {
		color: green;
	}
	p :not(.foo) {
		color: red;
	}
	p :not(.unused) {
		color: red;
	}
</style>