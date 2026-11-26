{#if await false}
	<p id="if-branch">if branch</p>
{:else}
	<p id="else-branch">{await 'else branch'}</p>
{/if}
