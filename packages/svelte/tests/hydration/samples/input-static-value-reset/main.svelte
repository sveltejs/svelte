<script lang="ts">
	let defaultValue = $state('default');
</script>

<form>
	<input value="initial" />
	<input value="initial" defaultValue="explicit" />
	<input value="initial" {...{ defaultValue }} />
	<button type="reset">reset</button>
</form>

<button type="button" onclick={() => (defaultValue = 'changed')}>change default</button>
