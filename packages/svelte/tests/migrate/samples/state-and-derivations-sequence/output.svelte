<script>
	let count = $state((void 0, 0));
	// semicolon at the end
	let doubled = $derived((void 0, count * 2));
	let { quadrupled } = $derived((void 0, { quadrupled: count * 4 }));
	// no semicolon at the end
	let time_8 = $derived((void 0, count * 8))
	let { time_16 } = $derived((void 0, { time_16: count * 16 }))
</script>

<!-- reassign to migrate to state -->
<button onclick={()=> count++}></button>

{count} / {doubled} / {quadrupled} / {time_8} / {time_16}