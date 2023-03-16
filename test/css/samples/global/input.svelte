<div>red</div>
<div class='foo'>bold/blue</div>

<style>
	:global(div) {
		color: red;
	}

	:global(div).foo {
		color: blue;
	}

	:global(div.foo) {
		color: pink;
	}

	:global(.foo) {
		font-weight: bold;
	}
</style>