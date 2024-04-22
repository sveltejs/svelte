<style>
	::foo:global([data-state='checked']) {
		color: red;
	}
	::foo:global(.foo) {
		color: red;
	}
	::foo:global(#foo) {
		color: red;
	}
	::foo:global(::foo) {
		color: red;
	}
	::foo:global(:foo) {
		color: red;
	}
	:global(h1) {
		color: red;
	}
	::foo:global(h1) {
		color: red;
	}
</style>

<div>
	<h1>hello world</h1>
</div>