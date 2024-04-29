<script>
	let count = 0;
	let doubled = $derived(count * 2);
	let { quadrupled } = $derived({ quadrupled: count * 4 });
</script>

{count} / {doubled} / {quadrupled}