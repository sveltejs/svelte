<div class='animated'>animated</div>

<style>
	@keyframes why {
		from { color: red; }
		to { color: blue; }
	}

	@keyframes what {
		from { color: scale(1); }
		to { color: scale(1.5); }
	}

	.animated {
		animation:
			why 2s,
			what 2s;
	}
</style>
