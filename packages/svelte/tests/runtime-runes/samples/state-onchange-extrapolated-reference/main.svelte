<script>
	let arr = $state([{ count: 1 }, { count: 1 }], {
		onchange(){
			console.log("arr");
		}
	});

	const item = arr.pop();

	const item_2 = arr[0];

	arr[0] = { count: 1 };

	let obj = $state({ value: { count: 0 }, key: { count: 0 } }, {
		onchange(){
			console.log("obj");
		}
	});

	const item_3 = obj.value;
	delete obj.value;

	const values = [...Object.values(obj)];

	delete obj.key;
</script>

<button onclick={()=> item.count++}>{item.count}</button>
<button onclick={()=> item_2.count++}>{item_2.count}</button>
<button onclick={()=> item_3.count++}>{item_3.count}</button>
<button onclick={()=> values[0].count++}>{values[0].count}</button>
