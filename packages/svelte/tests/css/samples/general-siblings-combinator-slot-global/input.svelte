<div>
	<p class="before">before</p>
	<slot></slot>
	<p class="foo">
		<span>foo</span>
	</p>
	<p class="bar">bar</p>
</div>

<style>
	.before + .foo { color: green; }
	.before ~ .foo { color: green; }
	.before ~ .bar { color: green; }

	:global(.x) + .foo { color: green; }
	:global(.x) + .foo span { color: green; }
	:global(.x) ~ .foo { color: green; }
	:global(.x) ~ .foo span { color: green; }
	:global(.x) ~ .bar { color: green; }

	/* no match */
	:global(.x) + .bar { color: green; }
</style>
