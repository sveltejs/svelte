<script>
	let value = $state();
	let null_value = $state(null);
	let explicit_value = $state('bar');
	let checked = $state();
	let false_checked = $state(false);
	let spread_undefined_value = { value };
	let spread_explicit_value = { value: 'spread' };
	let spread_false_checked = { checked: false };
</script>

<input defaultValue="foo" />
<input defaultValue="foo" value={value} />
<input defaultValue="foo" value={null_value} />
<input defaultValue="foo" value={explicit_value} />
<input defaultValue="foo" bind:value />
<input defaultValue="foo" {...spread_undefined_value} />
<input defaultValue="foo" {...spread_explicit_value} />
<input type="checkbox" defaultChecked />
<input type="checkbox" defaultChecked checked={checked} />
<input type="checkbox" defaultChecked checked={false_checked} />
<input type="checkbox" defaultChecked bind:checked />
<input type="checkbox" defaultChecked {...spread_false_checked} />
<input value="bar" defaultValue="foo" />
<input type="checkbox" checked={false} defaultChecked />
