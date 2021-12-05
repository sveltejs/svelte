<script>
	let num = 0;
	let cards = [];
	
	function click() {
		// updating cards via push should have no effect to the ul,
		// since its being mutated instead of reassigned
		cards.push(num++);
	}
</script>
<button on:click={click}>
	Click Me
</button>

{num}
<ul>
	{#each cards as c, i (i)}
		<li>{c}</li>
  {/each}
</ul>
