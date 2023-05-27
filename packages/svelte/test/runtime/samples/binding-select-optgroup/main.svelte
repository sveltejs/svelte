<script>
	export let name;
</script>

<h1>Hello {name}!</h1>

<select bind:value={name}>
	<option value="Harry">Harry</option>
	<optgroup label="Group">
		<option value="World">World</option>
	</optgroup>
</select>