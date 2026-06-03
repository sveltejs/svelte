<script>
	function firstTest() {
		return Promise.resolve('<p>first test</p>');
	}

	function otherTest() {
		return Promise.resolve('other test');
	}
</script>

<div>
	<div>{@html await firstTest()}</div>
	{await otherTest()}
</div>
