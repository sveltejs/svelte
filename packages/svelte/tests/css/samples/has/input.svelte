<x>
	<y>
		<z></z>
		{#if foo}
			<d></d>
		{/if}
	</y>
</x>
<c></c>

<style>
	x:has(y) {
		color: green;
	}
	x:has(z) {
		color: green;
	}
	x:has(:global(y)) {
		color: green;
	}
	x:has(:global(z)) {
		color: green;
	}
	x:has(:global(.foo)) {
		color: green;
	}
	:global(.foo):has(y) {
		color: green;
	}

	.unused:has(y) {
		color: red;
	}
	.unused:has(:global(y)) {
		color: red;
	}
	x:has(.unused) {
		color: red;
	}
	:global(.foo):has(.unused) {
		color: red;
	}

	x:has(y, .unused) {
		color: green;
	}
	x:has(y, :global(.foo)) {
		color: green;
	}
	x:has(y):has(.unused) {
		color: red;
	}
	x:has(y):has(:global(.foo)) {
		color: green;
	}

	x:has(y) z {
		color: green;
	}
	x:has(y) {
		z {
			color: green;
		}
	}
	x:has(y) :global(.foo) {
		color: green;
	}
	x:has(y) {
		.unused {
			color: red;
		}
	}

	x y:has(z) {
		color: green;
	}
	x {
		y:has(z) {
			color: green;
		}
	}
	:global(.foo) x:has(y) {
		color: green;
	}
	.unused x:has(y) {
		color: red;
	}
	.unused:has(.unused), x:has(y) {
		color: green;
	}

	x:has(> y) {
		color: green;
	}
	y:has(> d) {
		color: green;
	}
	x:has(> z) {
		color: red;
	}
	x:has(> d) {
		color: red;
	}
	x > y:has(z) {
		color: green;
	}

	x:has(y) z {
		color: green;
	}
	x:has(y) + c {
		color: green;
	}
</style>
