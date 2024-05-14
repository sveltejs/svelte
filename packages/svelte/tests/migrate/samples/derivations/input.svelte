<script>
	let count = 0;
	$: doubled = count * 2;
	$: ({ quadrupled } = { quadrupled: count * 4 });
</script>

{count} / {doubled} / {quadrupled}
