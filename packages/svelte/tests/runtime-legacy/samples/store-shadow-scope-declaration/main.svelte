<script>
	function test(store) {
		// allow declaring $store as parameter
		// it's not referring to the store value of the
		// `store` variable in the upper scope
		return derived(store, $store => {

		});
	}

	function test2(store) {
		// allow declaring the `$store` variable
		// it is not referring to the store value of the `store` variable
		let $store;
	}
</script>

<div
	on:test={(store) => {
		derived(store, $store => {});
	}}
	on:test2={(store) => {
		let $store;
	}}
/>
