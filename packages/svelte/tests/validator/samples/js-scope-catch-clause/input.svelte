<script>
	function test() {
		try {
			throw new TypeError("oops1");
		} catch (error) {
			console.log(error);
		}
		
		try {
			throw new TypeError("oops2");
		} catch (error) {
			console.log(error);
		}
	}
	test();
</script>