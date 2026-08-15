{#await promise catch error}
	<p>The error is {error}</p>
{/await}

{#await promise then value}
	<p>The value is {value}</p>
{/await}

{#await promise catch}
	<p>Something went wrong</p>
{/await}

{#await promise}
	<p>waiting for the promise to resolve...</p>
{:then}
	<p>the promise resolved</p>
{:catch error}
	<p>The error is {error}</p>
{/await}

{#await promise}
	<p>waiting for the promise to resolve...</p>
{:catch}
	<p>Something went wrong</p>
{/await}
