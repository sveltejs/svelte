{#each Array(1)}
	{let ref = $state()}
	{let count = $state(0)}
	<button onclick={()=>count++} bind:this={ref}>{count}</button>
	<button onclick={()=>ref.click()}></button>
{/each}