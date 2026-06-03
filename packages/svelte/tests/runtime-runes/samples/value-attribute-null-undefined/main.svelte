<script>
	let value = $state();
</script>

<input type="text" {value} />

<button id="setString" onclick={() => {value = "foo";}}></button>
<button id="setNull" onclick={() => {value = null;}}></button>
<button id="setUndefined" onclick={() => {value = undefined;}}></button>
