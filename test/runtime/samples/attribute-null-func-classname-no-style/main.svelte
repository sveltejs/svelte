<script>
	export let testName;

	function myHelper(testName) {
		return testName;
	}
</script>

<div class={myHelper(testName)}></div>
