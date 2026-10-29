<script>
	let x = $state(0);
	let y = $state(0);
	let a = $derived(x > 0);
	let b = $derived(y > 0);
	let d = $derived(`${a} ${b}`);
</script>

<button
	onclick={() => {
		x = 1;
		y = 1;
	}}>set</button
>
<button
	onclick={() => {
		x = 0;
		y = 0;
		d = 'override';
	}}>reset</button
>
<button onclick={() => (y = 1)}>y</button>
<p>{d}</p>
