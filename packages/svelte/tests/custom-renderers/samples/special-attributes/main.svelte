<script>
	let value = $state("hello");
	let class_name = $state("hello");
	let style = $state("color: blue");
	let checked = $state(true);
	let default_value = $state("default_val");
	let default_checked = $state(true);
	let spread = $derived({value, class: class_name, style});
</script>

<input {value} class={class_name} {style} />
<input type="checkbox" checked={checked} />
<input value="fixed" defaultValue={default_value} />
<input type="checkbox" checked defaultChecked={default_checked} />
<input {...spread} />

<button onclick={() => {
	value = "world";
	class_name = "world";
	style = "color: red";
	checked = false;
	default_value = "new_default";
	default_checked = false;
}}>update</button>
