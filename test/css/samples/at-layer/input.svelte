<div>hello</div>

<style>
	@layer base, special;

	@layer special {
		div {
			color: rebeccapurple;
		}
	}

	@layer base {
		div {
			color: green;
		}
	}
</style>
