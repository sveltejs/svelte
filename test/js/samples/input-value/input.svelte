<script>
	let name = 'change me';

	function onInput(event) {
		name = event.target.value
	}
</script>

<input value={name} on:input={onInput}>
<input type="email" value={name} on:input={onInput}>
<input type="month" value={name} on:input={onInput}>
<input type="number" value={name} on:input={onInput}>
<input type="password" value={name} on:input={onInput}>
<input type="search" value={name} on:input={onInput}>
<input type="tel" value={name} on:input={onInput}>
<input type="text" value={name} on:input={onInput}>
<input type="url" value={name} on:input={onInput}>
<input type="week" value={name} on:input={onInput}>

<input type="button" value={name} on:input={onInput}>
<input type="checkbox" value={name} on:input={onInput}>
<input type="color" value={name} on:input={onInput}>
<input type="date" value={name} on:input={onInput}>
<input type="datetime-local" value={name} on:input={onInput}>
<input type="file" value={name} on:input={onInput}>
<input type="hidden" value={name} on:input={onInput}>
<input type="image" value={name} on:input={onInput} alt={name}>
<input type="radio" value={name} on:input={onInput}>
<input type="range" value={name} on:input={onInput}>
<input type="reset" value={name} on:input={onInput}>
<input type="submit" value={name} on:input={onInput}>
<input type="time" value={name} on:input={onInput}>
<h1>{name}!</h1>
