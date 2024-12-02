<script>
	let focused = $state(false)
	
	function get_rest() {
		console.log("get_rest");
		return {
			"data-rest": "true"
		}
	}

</script>

<input 
	onfocus={() => focused = true} 
	onblur={() => focused = false} 
	class:dark={true} 
	class={`${focused ? 'focused' : ''}`} 
	{...get_rest()} 
>