<script>
	export let testName1;
  export let testName2;
  

	function myHelper(testName) {
		return testName;
	}
</script>

<div class={myHelper(testName1) + myHelper(testName2)}></div>
