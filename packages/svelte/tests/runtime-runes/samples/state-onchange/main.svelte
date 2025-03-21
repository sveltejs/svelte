<script>
	let count = $state(0, {
		onchange(){
			console.log("count");
		}
	})
</script>

<button onclick={()=> count++}>{count}</button>