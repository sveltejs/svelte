<header>
	<nav class="active"></nav>		
</header>

<style>
	nav {
		header:has(&){
			color: green;
		}
		.unused:has(&){
			color: red;
		}
	}

	header {
		> nav {
			color: green;

			&.active {
				color: green;
			}

			&.unused {
				color: red;
			}
		}
	}

	header {
		& > nav {
			color: green;

			&.active {
				color: green;
			}

			&.unused {
				color: red;
			}
		}
	}
</style>