<script>
	let value = $state('');
	let nullable_value = $state(null);
	let checked = $state(false);
	let nullable_checked = $state(null);
</script>

<input type="text" {value}>
<input type="text" {...{ value }}>
<input type="text" {...{ value: nullable_value }}>
<input type="text" value={await Promise.resolve(value)}>
<input type="text" {...{ value: await Promise.resolve(value) }}>
<input type="text" defaultValue="server" value={await Promise.resolve(value)}>
<textarea {value}></textarea>
<input type="checkbox" {checked}>
<input type="checkbox" {...{ checked }}>
<input type="checkbox" {...{ checked: nullable_checked }}>
<button
	onclick={() => {
		value = 'updated';
		nullable_value = 'updated';
	}}>update value</button
>
<button
	onclick={() => {
		checked = !checked;
		nullable_checked = checked;
	}}>toggle checked</button
>
