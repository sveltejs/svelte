<script>
	let value = $state("hello");
	let checked = $state(true);
	let default_value = $state("default_val");
	let default_checked = $state(true);
	let spread = $derived({value});
</script>

<input value={value} />
<input type="checkbox" checked={checked} />
<input value="fixed" defaultValue={default_value} />
<input type="checkbox" checked defaultChecked={default_checked} />
<input {...spread} />

<button onclick={() => {
	value = "world";
	checked = false;
	default_value = "new_default";
	default_checked = false;
}}>update</button>
