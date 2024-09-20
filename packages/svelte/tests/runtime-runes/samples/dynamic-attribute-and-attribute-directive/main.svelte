<script>
	let value = $state(0);

	function dark(){
		console.log('called')
		return false;
	}

	function get_class(){
		return 'dark';
	}

	function color(){
		console.log('called')
		return 'red';
	}

	function get_style(){
		return 'color: green';
	}
</script>

<div class:dark={dark()} class={get_class()}></div>
<div style:color={color()} style={get_style()}></div>
<button onclick={()=> value++}>{value}</button>
