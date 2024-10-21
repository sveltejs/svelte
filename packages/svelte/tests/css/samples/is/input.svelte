<x>
	<y>
		<z></z>
	</y>
</x>

<style>
	x :is(y) {
		color: green;
	}
	x :is(y, .unused) {
		color: green;
	}
	x :is(.unused) {
		color: red;
	}

	x :is(:global(y)) {
		color: green;
	}
	x :is(:global(.foo)) {
		color: green;
	}

	:global(.foo) :is(x) {
		color: green;
	}
	:global(.foo) :is(.unused) {
		color: red;
	}

	x :is(:global(html *)) {
		color: green;
	}
	x :is(html *) {
		color: red; /* TODO would be nice to prune this one day */
	}
	y :is(x *) {
		color: green; /* matches z */
	}
</style>
