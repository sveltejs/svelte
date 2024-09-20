<script>
	let count = 0;
	// semicolon at the end
	let doubled = $derived(count * 2);
	let { quadrupled } = $derived({ quadrupled: count * 4 });
	// no semicolon at the end
	let time_8 = $derived(count * 8)
	let { time_16 } = $derived({ time_16: count * 16 })
</script>

{count} / {doubled} / {quadrupled} / {time_8} / {time_16}
