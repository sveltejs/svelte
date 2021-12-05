<script>
	export let x;
</script>

<button class='baz' on:click='{() => x = "r"}'>baz</button>
<p>baz x: {x}</p>