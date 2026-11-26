<script lang="ts">
	let value = $state('initial');
	let defaultValue = $state('default');
</script>

<form>
	<input value="initial" />
	<input value="initial" defaultValue="explicit" />
	<input value="initial" {defaultValue} />
	<input value="initial" {...{ defaultValue }} />
	<input {...{ defaultValue }} bind:value={value} />
	<button type="reset">reset</button>
</form>

<button type="button" onclick={() => (defaultValue = 'changed')}>change default</button>
<output>{value}</output>
