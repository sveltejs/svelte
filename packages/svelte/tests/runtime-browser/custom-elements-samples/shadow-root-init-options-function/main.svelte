<svelte:options
	customElement={{
		tag: 'custom-element',
		shadow: () => ({
			mode: 'open',
			// This could also be some env variable.
			clonable: window.temp_variable
		})
	}}
/>

<h1>Hello world!</h1>
