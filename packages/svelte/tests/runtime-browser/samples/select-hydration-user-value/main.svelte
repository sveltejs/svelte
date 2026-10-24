<script>
	export let value = 'a';
	export let number = 1;
	export let values = ['a'];
	export let cleared = ['a'];
	export let objects = [{ label: 'a' }, { label: 'b' }];
	export let object = objects[0];
	export let untouched = 'a';
	export let unselected;
</script>

<form>
	<select id="single" bind:value>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>
	<select id="number" bind:value={number}>
		<option value={1}>One</option>
		<option value={2}>Two</option>
	</select>
	<select id="multiple" multiple bind:value={values}>
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>
	<select id="untouched" bind:value={untouched}>
		<option value="a">A</option>
		<option value="b">B</option>
	</select>
	<select id="cleared" multiple bind:value={cleared}>
		<option value="a">A</option>
		<option value="b">B</option>
	</select>
	<select id="object" bind:value={object}>
		{#each objects as item}
			<option value={item}>{item.label}</option>
		{/each}
	</select>
	<select id="unselected" bind:value={unselected}>
		<option disabled value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
	</select>
</form>
