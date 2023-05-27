<style>
	:global(div) > div {
		color: red;
	}
	div:global(.foo) > div {
		color: red;
	}
	a:global(.foo) > div {
		color: red;
	}
</style>

<div>
	<div />
</div>