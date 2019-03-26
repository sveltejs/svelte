<script>
	let obj = {
		arr: [2, 0, 1],
		arr2: [[6, 5], 3, 4]
	};

	function change() {
		obj.arr = obj.arr.sort();
		obj.arr[0]++
		obj.arr[0] += 1
		obj.arr[0] = 2
		obj.arr2[0][0]++
		obj.arr2[0][0] = 3
	}

	setTimeout(change, 1);
</script>

Array in Object: {obj.arr}<br>
Array in Array in Object: {obj.arr2}
