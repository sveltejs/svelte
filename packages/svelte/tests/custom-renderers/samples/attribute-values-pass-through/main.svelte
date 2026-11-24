<script lang="ts">
	let on = $state(true);
	let text: string | null = $state('hello');
</script>

<toggle checked={on} />
<toggle {...{ checked: on }} />
<option selected={on} />
<option {...{ selected: on }} />
<field value={text} />
<field {...{ value: text }} />
<other enabled={on} />

<button
	onclick={() => {
		on = false;
		text = null;
	}}>update</button
>
