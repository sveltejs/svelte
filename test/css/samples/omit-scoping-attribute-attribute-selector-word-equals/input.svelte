<div>
	<p data-foo='qux bar'>this is styled</p>
	<p data-foo='qux baz'>this is unstyled</p>
</div>

<style>
	[data-foo~='bar'] {
		color: red;
	}
</style>