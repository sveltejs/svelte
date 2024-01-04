<style>
    /* test that all these are parsed correctly */
	::view-transition-old(x-y)  {
		color: red;
    }
	:global(::view-transition-old(x-y))  {
		color: red;
    }
	::highlight(rainbow-color-1) {
		color: red;
	}
	custom-element::part(foo) {
		color: red;
	}
	::slotted(.content) {
		color: red;
	}
	:is( /*button*/
		button, /*p after h1*/
		h1 + p
		){
		color: red;
	}
</style>
