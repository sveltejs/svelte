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

		declared_in_constructor;
		declared_in_constructor_proxy;
		#assign_in_constructor;
		#assign_in_constructor_proxy;

		constructor(){
			this.#in_constructor = 42;
			this.#in_constructor_proxy.count++;
			this.declared_in_constructor = $state(0, {
				onchange(){
					console.log("declared in constructor");
				}
			});
			this.declared_in_constructor_proxy = $state({ count: 0 }, {
				onchange(){
					console.log("declared in constructor proxy");
				}
			});
			this.#assign_in_constructor = $state(0, {
				onchange(){
					console.log("assign in constructor");
				}
			});
			this.#assign_in_constructor++;
			this.#assign_in_constructor_proxy = $state({ count: 0 }, {
				onchange(){
					console.log("assign in constructor proxy");
				}
			});
			this.#assign_in_constructor_proxy.count++;
		}
	}

	const class_test = new Test();
</script>

<button onclick={()=> class_test.count++}>{class_test.count}</button>
<button onclick={()=> class_test.proxy.count++}>{class_test.proxy.count}</button>
<button onclick={()=> class_test.proxy = {count: class_test.proxy.count+1}}>{class_test.proxy.count}</button>
<button onclick={()=> class_test.declared_in_constructor++}>{class_test.declared_in_constructor}</button>
<button onclick={()=> class_test.declared_in_constructor = class_test.declared_in_constructor + 1 }>{class_test.declared_in_constructor}</button>
<button onclick={()=> class_test.declared_in_constructor_proxy.count++}>{class_test.declared_in_constructor_proxy.count}</button>
<button onclick={()=> class_test.declared_in_constructor_proxy.count = class_test.declared_in_constructor_proxy.count + 1 }>{class_test.declared_in_constructor_proxy.count}</button>