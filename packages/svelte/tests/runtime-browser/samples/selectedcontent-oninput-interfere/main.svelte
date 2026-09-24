<script lang="ts">
	let value = $state('A');
</script>

<input oninput={() => {}} />
<select bind:value>
	<button><selectedcontent></selectedcontent></button>
	<option>A</option>
	<option>B</option>
	<option>C</option>
</select>

<style>
	select,::picker(select){
		appearance: base-select;
	}
</style>