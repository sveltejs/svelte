<script>
	let default_val = $state("default_val");
	let default_chk = $state(true);
	let spread_val = $derived({ defaultValue: default_val });
	let spread_chk = $derived({ defaultChecked: default_chk });
</script>

<input value="fixed" defaultValue={default_val} />
<input value="fixed" {...spread_val} />
<input type="checkbox" checked defaultChecked={default_chk} />
<input type="checkbox" checked {...spread_chk} />

<button onclick={() => {
	default_val = "new_default";
	default_chk = false;
}}>update</button>
