<div class='animated'>animated</div>
<div class='also-animated'>also animated</div>

<style>
	@keyframes why {
		0% { color: red; }
		33.3% { color: yellow }
		66.7% { color: green }
		100% { color: blue; }
	}

	.animated {
		animation: why 2s;
	}

	.also-animated {
		animation: not-defined-here 2s;
	}
</style>
