<script lang="ts"></script>

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
	{type === 'all' ? 'All types' : type}
	{type !== 'all'}
	{type == 'all'}
	{type != 'all'}
	{type + 1}
	{type - 1}
	{type * 2}
	{type / 2}
	{type > 1}
	{type instanceof Foo}
	{type instanceof /* comment */ Object}
	{type in foo}
	<!-- ... this one should trigger though -->
	{type foo = boolean}
{/if}
