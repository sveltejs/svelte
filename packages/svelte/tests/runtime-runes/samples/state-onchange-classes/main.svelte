<script>
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

		#in_constructor = $state(0, {
			onchange(){
				console.log("constructor count");
			}
		});

		#in_constructor_proxy = $state({ count: 0 }, {
			onchange(){
				console.log("constructor proxy");
			}
		});

		constructor(){
			this.#in_constructor = 42;
			this.#in_constructor_proxy.count++;
		}
	}

	const class_test = new Test();
</script>

<button onclick={()=> class_test.count++}>{class_test.count}</button>
<button onclick={()=> class_test.proxy.count++}>{class_test.proxy.count}</button>
<button onclick={()=> class_test.proxy = {count: class_test.proxy.count+1}}>{class_test.proxy.count}</button>