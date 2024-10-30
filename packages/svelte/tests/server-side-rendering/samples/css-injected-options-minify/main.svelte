<svelte:options css="injected" />

<div class="foo">foo</div>

<style>
	.foo {
		color: green;
	}
	.unused {
		color: red;
	}
	.unused {
		.nested-unused {
			color: red;
		}
	}
	.unused:has(.unused) {
		color: red;
	}
	.foo, .unused {
		color: green;
	}
</style>
