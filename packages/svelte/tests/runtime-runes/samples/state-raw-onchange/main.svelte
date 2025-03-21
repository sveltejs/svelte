<script>
	let count = $state.raw(0, {
		onchange(){
			console.log("count");
		}
	})

	let object = $state.raw({count: 0}, {
		onchange(){
			console.log("object");
		}
	})

	class Test{
		count = $state.raw(0, {
			onchange(){
				console.log("class count");
			}
		})
		object = $state.raw({count: 0}, {
			onchange(){
				console.log("class object");
			}
		})

		#in_constructor = $state(0, {
			onchange(){
				console.log("constructor count");
			}
		});

		#in_constructor_proxy = $state({ count: 0 }, {
			onchange(){
				console.log("constructor object");
			}
		});


		constructor(){
			this.#in_constructor++;
			this.#in_constructor_proxy.count++;
		}
	}

	const class_test = new Test();

	let arr = $state.raw([0,1,2], {
		onchange(){
			console.log("arr");
		}
	})
</script>

<button onclick={()=> count++}>{count}</button>
<button onclick={()=> object.count++}>{object.count}</button>
<button onclick={()=> object = {count: object.count+1}}>{object.count}</button>

<button onclick={()=> class_test.count++}>{class_test.count}</button>
<button onclick={()=> class_test.object.count++}>{class_test.object.count}</button>
<button onclick={()=> class_test.object = {count: class_test.object.count+1}}>{class_test.object.count}</button>

<button onclick={()=> arr.push(arr.length)}>push</button>
<button onclick={()=>arr.splice(0, 2)}>splice</button>
<button onclick={()=>arr.sort((a,b)=>b-a)}>sort</button>
<button onclick={()=>arr = []}>assign</button>
