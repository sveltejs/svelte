<script>
	export let color = 'red'
</script>

<h1 style:background-color={color} >hello</h1>
<h1 style:background-color="{color} important">hello</h1>
<h1 style:background-color="{color} !important">hello</h1>
<h1 style:background-color="{color} !important;">hello</h1>
<h1 style="background-color: {color} !important">hello</h1>
<h2 style:--background-color={color}>hello</h2>
<h2 style:--background-color="{color} !important;">hello</h2>

<style>
	h1 {
		background-color: blue !important;
	}
	h2 {
		--background-color: blue !important;
		background-color: var(--background-color);
	}
</style> 