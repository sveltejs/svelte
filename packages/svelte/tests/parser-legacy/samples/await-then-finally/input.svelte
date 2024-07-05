{#await thePromise}
	<p>loading...</p>
{:then theValue}
	<p>the value is {theValue}</p>
{:catch theError}
	<p>oh no! {theError.message}</p>
{:finally}
	<p>Finally</p>
{/await}
