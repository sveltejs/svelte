<script>
	/** @type {{ bar?: any }}*/
	let foo = $state({});
	let bar = {};

	foo.bar = bar;

	console.log(foo.bar === bar); // false because of the $state proxy
	console.log($state.is(foo.bar, bar)); // true
</script>
