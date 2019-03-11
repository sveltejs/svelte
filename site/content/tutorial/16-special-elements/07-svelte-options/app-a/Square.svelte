<script>
	export let cx;
	export let cy;
	export let size;
	export let style;

	$: x1 = cx - size / 2;
	$: y1 = cy - size / 2;
	$: x2 = x1 + size;
	$: y2 = y1 + size;
</script>

<polygon points="{x1},{y1} {x2},{y1} {x2},{y2} {x1},{y2}" {style}/>
