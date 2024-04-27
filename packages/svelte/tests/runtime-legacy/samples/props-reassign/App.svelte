<script>
	$: $$props.a = $$props.a * 2;
</script>

<p>{$$props.a} {$$props.b}</p>
<button on:click={() => $$props.b = 'b'}>update</button>
