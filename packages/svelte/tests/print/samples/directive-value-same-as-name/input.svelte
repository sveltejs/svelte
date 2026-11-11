<button on:click={click} use:tooltip={tooltip} in:fly={fly} out:fade={fade}>click</button>

<p transition:slide={slide}>...</p>

{#each items as item (item.id)}
	<div animate:flip={flip}>{item.name}</div>
{/each}
