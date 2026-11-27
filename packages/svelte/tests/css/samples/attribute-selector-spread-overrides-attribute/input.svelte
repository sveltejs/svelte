<script>
	const a = { 'data-a': '1' };
	const b = { id: 'b' };
	const c = { 'data-c': '1' };
</script>

<div data-a="2" {...a}></div>
<p id="a" {...b}></p>
<span data-c {...c}></span>

<style>
	div[data-a='1'] {
		color: red;
	}

	p#b {
		color: blue;
	}

	span[data-c='1'] {
		color: green;
	}
</style>
