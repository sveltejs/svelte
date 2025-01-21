<script>
	let count = $state.raw(0, {
		onchange(){
			console.log("count");
		}
	})

	let proxy = $state.raw({count: 0}, {
		onchange(){
			console.log("proxy");
		}
	})

	class Test{
		count = $state.raw(0, {
			onchange(){
				console.log("class count");
			}
		})
		proxy = $state.raw({count: 0}, {
			onchange(){
				console.log("class proxy");
			}
		})
	}

	const class_test = new Test();

	let arr = $state.raw([0,1,2], {
		onchange(){
			console.log("arr");
		}
	})
</script>

<button onclick={()=> count++}>{count}</button>
<button onclick={()=> proxy.count++}>{proxy.count}</button>
<button onclick={()=> proxy = {count: proxy.count+1}}>{proxy.count}</button>

<button onclick={()=> class_test.count++}>{class_test.count}</button>
<button onclick={()=> class_test.proxy.count++}>{class_test.proxy.count}</button>
<button onclick={()=> class_test.proxy = {count: class_test.proxy.count+1}}>{class_test.proxy.count}</button>

<button onclick={()=> arr.push(arr.length)}>push</button>
<button onclick={()=>arr.splice(0, 2)}>splice</button>
<button onclick={()=>arr.sort((a,b)=>b-a)}>sort</button>
<button onclick={()=>arr = []}>assign</button>