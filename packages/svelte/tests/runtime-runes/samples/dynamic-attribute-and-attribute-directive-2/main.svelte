<script>
	let value = $state(0);
	function dark(){
		console.log('updated class directive');
		return true;
	}
	function get_class(){
		console.log('updated class attribute');
		return value % 2 ? 'big' : 'small';
	}
	function color(){
		console.log('updated style directive');
		return "green";
	}
	function get_style(){
		console.log('updated style attribute');
		return value % 2 ? 'background: red' : 'background: green';
	}
</script>

<div class:dark={dark()} class={get_class()}></div>
<div style:color={color()} style={get_style()}></div>
<button onclick={()=> value++}>switch</button>