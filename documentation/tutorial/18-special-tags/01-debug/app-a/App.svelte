<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

<input bind:value={user.firstname} />
<input bind:value={user.lastname} />

{(console.log(user), '')}

<h1>Hello {user.firstname}!</h1>
