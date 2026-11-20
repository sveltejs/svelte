<div class="a"><span class="nested"></span></div>
<div class="b"></div>
<div class="c"></div>
<div class="d"></div>

<style>
	.a {
		color: red;;
		animation: spin 1s;;
		.nested {
			color: green;
		};
		background: blue;
	}

	.b {
		;
		animation-name: spin;
	}

	.c {
		color: red; /* comment */ ;
	}

	.d {;;}

	@keyframes spin {
		from {
			opacity: 0;;
		}
		to {
			opacity: 1;
		}
	}
</style>
