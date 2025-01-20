<script>
	let count = $state(0, {
		onchange(){
			console.log("count");
		}
	})

	let proxy = $state({count: 0}, {
		onchange(){
			console.log("proxy");
		}
	})

	class Test{
		count = $state(0, {
			onchange(){
				console.log("class count");
			}
		})
		proxy = $state({count: 0}, {
			onchange(){
				console.log("class proxy");
			}
		})
	}

	const class_test = new Test();
</script>

<button onclick={()=> count++}>{count}</button>
<button onclick={()=> proxy.count++}>{proxy.count}</button>
<button onclick={()=> proxy = {count: proxy.count+1}}>{proxy.count}</button>

<button onclick={()=> class_test.count++}>{class_test.count}</button>
<button onclick={()=> class_test.proxy.count++}>{class_test.proxy.count}</button>
<button onclick={()=> class_test.proxy = {count: class_test.proxy.count+1}}>{class_test.proxy.count}</button>