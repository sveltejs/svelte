<div>someone could programmatically add a class to this, so having global be part of a modifier is necessary</div>
<span class="x">-</span>

<style>
	div:global(.blue) {
		color: blue;
	}
	span:global(.blue).x {
		color: blue;
	}
	span.x:global(.bg) {
		background: red;
	}
</style>
