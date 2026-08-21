<script>
	let a = $state(0);

	let b = $state(0);

	$inspect(a).with((...args)=>{
		console.log(...args);
		b;
	});
</script>

<button onclick={()=>a++}></button>
<button onclick={()=>b++}></button>