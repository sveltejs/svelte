<script>
	let width = 0;
	let mobile = $derived(width < 640);
	let x = $derived(!mobile);
</script>

{width / mobile / x}