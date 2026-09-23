<script>
	export let size = 30;
	export let spread = { width: 30, height: 30 };
</script>

<canvas id="attributes" width={size} height={size}></canvas>
<canvas id="spread" {...spread}></canvas>
