<div>
	<p data-foo='barbaz'>this is unstyled</p>
	<p data-foo='bazbar'>this is styled</p>
</div>

<style>
	[data-foo$='bar'] {
		color: red;
	}
</style>