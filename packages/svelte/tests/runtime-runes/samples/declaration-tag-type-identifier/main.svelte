<script lang="ts">
	const assetTypes = ['a', 'b', 'all'] as const;
	function type<T>(x: T): T {
		return x;
	}
</script>

<ul>
	{#each assetTypes as type (type)}
		<li>{type === 'all' ? 'All types' : type}</li>
	{/each}
</ul>

<p data-cast>{'cast' as string}</p>
<p data-generic-call>{type<string>('generic-call')}</p>
<p data-generic-call-space>{type <string>('generic-call-space')}</p>
