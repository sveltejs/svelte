<script>
	export let x = 0;

	$: x *= 2;
</script>

<button on:click='{() => x += 1}'>+1</button>
<p>count: {x}</p>
