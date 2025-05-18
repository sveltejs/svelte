<script>
	let state = {
		count: 0,
		attachment(){
			
		}
	};
</script>

<button onclick={()=>{
	state.count++;
}}>{state.count}</button>

<div {@attach state.attachment}></div>