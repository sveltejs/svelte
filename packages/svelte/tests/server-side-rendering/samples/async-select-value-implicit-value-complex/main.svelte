<select value={await Promise.resolve('dog')}>
	<option>
		{@render option("--Please choose an option--")}
	</option>
	<option>
		{@render option(Promise.resolve('dog'))}
	</option>
	<option>
		{@render option(Promise.resolve('cat'))}
	</option>
</select>

{#snippet option(val)}{await val}{/snippet}