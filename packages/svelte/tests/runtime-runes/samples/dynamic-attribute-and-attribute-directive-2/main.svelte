<script>
	let value = $state(0);

	function dark(){
		console.log('updated directive');
		return true;
	}

	function get_class(){
		console.log('updated attribute');
		return value % 2 ? 'big' : 'small';
	}
</script>

<div class:dark={dark()} class={get_class()}></div>
<button onclick={()=> value++}>switch</button>
