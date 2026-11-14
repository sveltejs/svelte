<div></div>

<style>
	@KEYFRAMES Spin {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@KeYfRaMeS spin {
		from { color: red; }
		to { color: blue; }
	}

	@-WEBKIT-KEYFRAMES Spin {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@-MoZ-KeYfRaMeS spin {
		from { color: red; }
		to { color: blue; }
	}

	@KEYFRAMES -global-GlobalSpin {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	div {
		ANIMATION: Spin 1s;
		-WeBkIt-AnImAtIoN-NaMe: spin;
		animation-name: Spin, spin, GlobalSpin;
	}
</style>
