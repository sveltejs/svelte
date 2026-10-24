<select>
	<option><span>Value 1</span></option>
	<option>Value 2</option>
</select>

<select>
	<button><selectedcontent></selectedcontent></button>
	<optgroup label="Group">
		<legend>Group</legend>
		<option><span>Value 1</span></option>
	</optgroup>
</select>

<select value="b">
	<button><selectedcontent></selectedcontent></button>
	<option value="a"><span>Value 1</span></option>
	<option value="b"><span>Value 2</span></option>
</select>

<select defaultValue="b">
	<button><selectedcontent></selectedcontent></button>
	<option value="a"><span>Value 1</span></option>
	<option value="b"><span>Value 2</span></option>
</select>

<select {...{ value: 'b' }}>
	<button><selectedcontent></selectedcontent></button>
	<option value="a"><span>Value 1</span></option>
	<option value="b"><span>Value 2</span></option>
</select>

{#snippet label(value)}
	<span>{value}</span>
{/snippet}

{#snippet options()}
	<option value="a">{@render label('A & B')}</option>
	<option value="b">{@render label('B < C')}</option>
	<option value="c">{'C < D'}</option>
{/snippet}

<select multiple value={['a', 'b']}>
	{@render options()}
</select>
