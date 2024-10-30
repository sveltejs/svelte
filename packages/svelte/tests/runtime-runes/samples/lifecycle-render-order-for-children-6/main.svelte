<script>
	function create_action(){
		let index = 0;
		return ()=>{
			console.log(index++);
		}
	}

	const content = create_action();
</script>

<div use:content></div>

{#each {length: 5} as _}
	<div>
		<div use:content></div>
	</div>
{/each}

