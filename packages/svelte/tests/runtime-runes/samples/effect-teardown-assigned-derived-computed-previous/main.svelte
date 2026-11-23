<script>
	let s = $state(0);
	let d = $derived(s * 10);

	$effect(() => {
		s;
		d;
		return () => console.log(`teardown: s=${s} d=${d}`);
	});
</script>

<button
	onclick={() => {
		s = 1;
		d = 99;
	}}>go</button
>
