<script>
	let x = 0;
	
	$: f = function f() {
		return x;
	}
</script>

<p>x={x}</p>
<p>f()={f()}</p>
<button on:click={()=>{x+=1;}}>Increment</button>