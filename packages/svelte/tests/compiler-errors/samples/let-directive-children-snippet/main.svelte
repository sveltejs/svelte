<script>
	import Child from './irrelevant';
	import Parent from './irrelevant';
</script>

<!-- ok -->
<Child let:value>
	{value}
	{#snippet foo()}x{/snippet}
</Child>
<Child>
	{#snippet children({ value })}{value}{/snippet}
</Child>
<Parent>
	<Child slot="foo" let:value>
		{#snippet children()}{value}{/snippet}
	</Child>
</Parent>

<!-- invalid -->
<Child let:value>
	{#snippet children()}Value is: {value}{/snippet}
</Child>
