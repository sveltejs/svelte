<script>
	let name = $state("tom");
	let email = $state("tom@mail.com");
	let number = $state(555);

	const fetch_name = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve("jerry")
			}, 100)
		})
	}

	const fetch_email = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve("jerry@mail.com")
			}, 100)
		})
	}
	
	const fetch_number = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(777)
			}, 100)
		})
	}

	const update = async () => {
		[ name = await fetch_name(), email = await fetch_email(), number = await fetch_number() ] = ["john"];
	}
</script>

<p>Name: {name}</p>
<p>Email: {email}</p>
<p>Number: {number}</p>
<button on:click={update}>Update me</button>
