<script>
	let arr = $state([0,1,2], {
		onchange(){
			console.log("arr");
		}
	})
</script>

<button onclick={()=> arr.push(arr.length)}>push</button>
<button onclick={()=>arr.splice(0, 2)}>splice</button>
<button onclick={()=>arr.sort((a,b)=>b-a)}>sort</button>
