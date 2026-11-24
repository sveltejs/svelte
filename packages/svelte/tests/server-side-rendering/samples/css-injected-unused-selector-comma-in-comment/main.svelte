<svelte:options css="injected" />

<div class="foo">foo</div>

<style>
	.unused /* a, b */, .foo {
		color: green;
	}
	.foo, .unused /* a, b */, .foo {
		color: green;
	}
	.unused, /* a, b */ .foo {
		color: green;
	}
</style>
