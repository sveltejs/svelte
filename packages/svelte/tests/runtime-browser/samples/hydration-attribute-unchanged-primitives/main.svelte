<script>
	let { index = 2, size = 24, focus = -1, on = true } = $props();
	const spread = { disabled: true, hidden: true, tabindex: -1 };
</script>

<div role="row" aria-rowindex={index} data-active={on}></div>
<a href="#top" tabindex={focus}>x</a>
<svg width={size} height={size} stroke-width={1.5} viewBox="0 0 24 24"></svg>
<button {...spread}>x</button>
