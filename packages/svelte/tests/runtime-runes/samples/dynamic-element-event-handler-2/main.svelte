<script>
	let saySomething = $state(name => {
		console.log('creating "Hello" handler for ' + name);
		return { handler: () => console.log('Hello ' + name) };
	});

	function change() {
		saySomething = name => {
			console.log('creating "Bye" handler for ' + name);
			return { handler: () => console.log('Bye ' + name) };
		}
	}
</script>

<button on:click={saySomething('Tama').handler}>Tama</button>
<button on:click={saySomething('Pochi').handler}>Pochi</button>

<br>
<button on:click={change}>Change Function</button>
