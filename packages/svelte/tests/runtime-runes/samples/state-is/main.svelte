<script>
  let state = $state({});
	let object = {};

	state.object = object;

	console.log(state.object === object); // false because of the $state proxy

	console.log($state.is(state.object, object)); // true
</script>
