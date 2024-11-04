<script>
	let count = 0;
	// semicolon at the end
	$: doubled = count * 2;
	$: ({ quadrupled } = { quadrupled: count * 4 });
	// no semicolon at the end
	$: time_8 = count * 8
	$: ({ time_16 } = { time_16: count * 16 })
	// preceding let that doesn't do anything
	let time_32;
	$: time_32 = count * doubled;
	let very_high;
	$: very_high = time_32 * count;
</script>

{count} / {doubled} / {quadrupled} / {time_8} / {time_16}
