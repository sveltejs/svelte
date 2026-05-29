{#if true}
	<!-- check that these doesn't trigger already -->
	{type}
	{type }
	{type && foo}
	{type || bar}
	{type % 2}
	{type .x}
	{type ?.x}
	{type ()}
	{type [1]}
	{type `tag`}
	<!-- ... this one should trigger though -->
	{type foo = boolean}
{/if}
