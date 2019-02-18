<script>
	import Rect from './Rect.svelte';

	export let x;
	export let y;
	export let width;
	export let height;
</script>

<svg>
	<Rect x='{x}' y='{y}' width='{width}' height='{height}'/>
</svg>
