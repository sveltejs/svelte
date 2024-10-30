<svelte:options css="injected" />

<div class="bar">bar</div>

<style>
	.bar {
		color: red;
	}
	.unused {
		.also-unused {
			color: green;
		}
	}
</style>
