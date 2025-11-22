{#if porridge.temperature > 100}
	<p>too hot1!</p>
{:else if 80 > porridge.temperature}
	<p>too cold!</p>
{:else}
	<p>just right!</p>
{/if}
