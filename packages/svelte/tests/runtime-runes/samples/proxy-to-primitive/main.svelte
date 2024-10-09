<script>
	let array = $state([1,2,3]);

	function addToArray() {
		array.push(array.length+1);
	}
</script>

<button onclick={addToArray}>add</button>

<ul>
	<li>{@html array}</li>
	<li>{@html array?.toString()}</li>
	<li>text {array}</li>
	<li>{array}</li>
	<li>{array?.toString()}</li>
	<li title={array}></li>
	<li title={array?.toString()}></li>
	<li><input type="text" value={array} readonly/> </li>
	<li><input type="text" value={array?.toString()} readonly/> </li>
</ul>
