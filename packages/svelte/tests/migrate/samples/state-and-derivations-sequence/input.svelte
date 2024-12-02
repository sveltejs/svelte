<script>
	let count = (void 0, 0);
	// semicolon at the end
	$: doubled = (void 0, count * 2);
	$: ({ quadrupled } = (void 0, { quadrupled: count * 4 }));
	// no semicolon at the end
	$: time_8 = (void 0, count * 8)
	$: ({ time_16 } = (void 0, { time_16: count * 16 }))
</script>

<!-- reassign to migrate to state -->
<button onclick={()=> count++}></button>

{count} / {doubled} / {quadrupled} / {time_8} / {time_16}
