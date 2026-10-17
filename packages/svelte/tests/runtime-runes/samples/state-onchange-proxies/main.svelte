<script>
	let proxy = $state({count: 0}, {
		onchange(){
			console.log("proxy");
		}
	})
</script>

<button onclick={()=> proxy.count++}>{proxy.count}</button>
<button onclick={()=> proxy = {count: proxy.count+1}}>{proxy.count}</button>
