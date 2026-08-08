<style>
	/* minifiers drop the whitespace after `of`, since the following token ends the identifier */
	li:nth-child(2n of.important) {
		background: red;
	}
	li:nth-child(even of#first) {
		background: red;
	}
	li:nth-last-child(-n+3 of[data-active]) {
		background: red;
	}
	li:nth-child(2n of*) {
		background: red;
	}
	li:nth-child(2n of:not(.excluded)) {
		background: red;
	}
	li:nth-child(2n of.a, .b) {
		background: red;
	}
	ul {
		& li:nth-child(2n of&.important) {
			background: red;
		}
	}
</style>

<li>Foo</li>
