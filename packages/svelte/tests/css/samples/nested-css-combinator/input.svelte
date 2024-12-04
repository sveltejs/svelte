<div class="foo">
	<div class="bar"></div>
</div>

<style>
	.foo {
		> .bar {
			color: red;
		}

		~ .unused {
			color: red;
		}
	}
</style>
