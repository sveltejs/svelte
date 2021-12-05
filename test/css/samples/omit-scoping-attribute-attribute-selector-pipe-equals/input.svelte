<div>
	<p data-foo='bar'>this is styled</p>
	<p data-foo='bar-baz'>this is styled</p>
	<p data-foo='baz-bar'>this is unstyled</p>
</div>

<style>
	[data-foo|='bar'] {
		color: red;
	}
</style>