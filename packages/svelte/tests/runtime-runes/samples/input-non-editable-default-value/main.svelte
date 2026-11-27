<script lang="ts">
	let defaultValue = $state('default');
</script>

<form>
	<input type="hidden" {...{ defaultValue }} />
	<input type="checkbox" {...{ defaultValue }} />
	<input type="radio" name="group" {...{ defaultValue }} />
	<input type="submit" {...{ defaultValue }} />
</form>

<button type="button" onclick={() => (defaultValue = 'changed')}>change default</button>
