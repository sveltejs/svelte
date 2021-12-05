{#await thePromise}
	<p>loading...</p>
{:catch theError}
	<p>oh no! {theError.message}</p>
{/await}