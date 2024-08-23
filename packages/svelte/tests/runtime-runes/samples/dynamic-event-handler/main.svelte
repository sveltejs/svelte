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

<button onclick={saySomething('Tama').handler}>Tama</button>
<button onclick={saySomething('Pochi').handler}>Pochi</button>

<br>
<button onclick={change}>Change Function</button>
