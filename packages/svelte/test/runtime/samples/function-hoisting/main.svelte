<script>
	export let greeting = 'Hello'
	let name = 'world';

  // both functions, and `name` are hoistable, but hoistMe does not get hoisted
	function hoistMeMaybe () {
		return hoistMe(name) // comment out this line => hoistMe is hoisted
	}

	function hoistMe (name) {
		return name
	}
</script>

<h1>{greeting}, {hoistMeMaybe()}</h1>
