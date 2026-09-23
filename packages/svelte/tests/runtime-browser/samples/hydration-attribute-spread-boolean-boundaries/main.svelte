<script>
	export let on = { disabled: true };
	export let to_true;
	export let to_false;
	export let kept;
</script>

<button {...on}>x</button>
<fieldset {...on}></fieldset>
<input {...on} />
<select {...on}><optgroup {...on} label="g"><option {...on}>o</option></optgroup></select>
<textarea {...on}></textarea>
<div {...on}></div>
<p {...to_true}>a</p>
<p {...to_false}>b</p>
<p {...kept}>c</p>
