<script>
	let color = "red";

	function change(){
		color = "green";
	}
</script>

<p style:color></p>

{#each [1] as _}
	<p style:color></p>
{/each}

<button on:click={change}></button>