<script>
	import Select from './Select.svelte'
</script>

<div>
	<label for="pet-select">Choose a pet 1:</label>
	<Select>
		<option value="">--Please choose an option--</option>
		<option value="dog">Dog</option>
		<option value="cat">Cat</option>
	</Select>
</div>

<div>
	<label for="pet-select">Choose a pet 2:</label>
	<select name="pets" id="pet-select2">
		<option value="">--Please choose an option--</option>
		<option value="dog">Dog</option>
		<option value="cat">Cat</option>
	</select>
</div>
