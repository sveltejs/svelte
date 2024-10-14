<script>
	let count = $state(1);
	function track(value){
		let val = value;
		$effect(() => {
			console.log("effect", val);
			return ()=>{
				console.log("clean", val);
			}
		});
		return value;
	}
</script>

{#if track(count)}
{/if}

<button onclick={()=> count++}></button>
