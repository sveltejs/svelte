{@html "some html"}

{#if false && {
	
}.x === 34}
	true
{:else if false}
	false
{/if}

{#await []}
	{@const x = 43}
	{x}
{:then i}
	{i}
{:catch e}
	dlkdj
{/await}

{#await [] then i}
stuff
{/await}

{#key count}
	dlkdj
{/key}