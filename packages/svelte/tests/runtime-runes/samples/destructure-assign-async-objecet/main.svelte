<script>
	let name = $state("tom");
	let email = $state("tom@mail.com");
	let number = $state(555);

	const fetch_user = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ name: "jerry", contacts: [777, "jerry@mail.com"] })
			}, 100)
		})
	}

	const update = async () => {
		({ name, contacts: [number, email] } = await fetch_user());
	}
</script>

<p>Name: {name}</p>
<p>Email: {email}</p>
<p>Number: {number}</p>
<button on:click={update}>Update me</button>
