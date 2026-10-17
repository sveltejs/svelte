{#await Promise.resolve('child')}
	<p data-pending>pending</p>
{:then value}
	<p data-child>{value}</p>
{/await}
