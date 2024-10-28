<p class="foo">foo</p>
<p class="bar">bar</p>

<style>
	:not(.foo) {
		color: green;
	}
	:not(.unused) {
		color: red;
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
</style>