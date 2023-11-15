<div>
	<p data-foo='foobarbaz'>this is styled</p>
	<p data-foo='fooBARbaz'>this is unstyled</p>
</div>

<style>
	[data-foo*='bar'] {
		color: red;
	}
</style>