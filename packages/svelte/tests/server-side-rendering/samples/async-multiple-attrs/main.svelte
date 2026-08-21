<script>
	const user = $derived(Promise.resolve({ 
		name: 'test',
		image: '',
	}))
</script>

<svelte:head>
<title>Async multiple attributes</title>
</svelte:head>

<img
	alt={(await user).name}
	src={(await user).image}
/>
