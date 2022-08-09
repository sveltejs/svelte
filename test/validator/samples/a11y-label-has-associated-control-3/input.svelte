<script>
	import MyLabel from "./MyLabel.svelte";
	import MyInput from "./MyInput.svelte";
	import CustomLabel from "./CustomLabel.svelte";
</script>

<MyLabel>xxx</MyLabel>
<CustomLabel>xxx</CustomLabel>
<MyLabel><input /></MyLabel>
<MyLabel><slot /></MyLabel>
<MyLabel><MyInput /></MyLabel>
<MyLabel><div><MyInput /></div></MyLabel>
<label><div><MyInput /></div></label>
