<script>
	let prevented = $state({ checked: false, text: '', select: 'a' });
	let allowed = $state({ checked: false, text: '', select: 'a' });
</script>

<form class="prevented" onreset={(e) => e.preventDefault()}>
	<input type="checkbox" bind:checked={prevented.checked} />
	<input bind:value={prevented.text} />
	<select bind:value={prevented.select}>
		<option value="a">a</option>
		<option value="b">b</option>
	</select>
	<button type="reset">Reset</button>
</form>

<form class="allowed">
	<input type="checkbox" bind:checked={allowed.checked} />
	<input bind:value={allowed.text} />
	<select bind:value={allowed.select}>
		<option value="a">a</option>
		<option value="b">b</option>
	</select>
	<button type="reset">Reset</button>
</form>

<p class="prevented">{JSON.stringify(prevented)}</p>
<p class="allowed">{JSON.stringify(allowed)}</p>
