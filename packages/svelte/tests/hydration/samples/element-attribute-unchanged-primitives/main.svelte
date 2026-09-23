<script>
	let { index, size = 24, gone, hidden, spread = { disabled: true, tabindex: -1, hidden } } = $props();
</script>

<div tabindex={-1} aria-rowindex={index} data-active={true} data-gone={gone}></div>
<svg width={size} height={size} stroke-width={1.5} viewBox="0 0 24 24"></svg>
<button {...spread}>x</button>
