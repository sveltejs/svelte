<script>
	let value = $state();
	let checked = $state(false);

	function setValues() {
		value = 'message';
		checked = true;
	}
	function clearValues() {
		value = null;
		checked = null;
	}
</script>

<button onclick={setValues}>setValues</button>
<button onclick={clearValues}>clearValues</button>

<input type="text" {value} />
<input type="text" {value} {...{}} />

<input type="checkbox" {checked} />
<input type="checkbox" {checked} {...{}} />
