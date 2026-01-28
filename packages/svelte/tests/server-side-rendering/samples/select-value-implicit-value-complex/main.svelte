<select value="dog">
	<option>
		{@render option("--Please choose an option--")}
	</option>
	<option>
		{@render option("dog")}
	</option>
	<option>
		{@render option("cat")}
	</option>
</select>

{#snippet option(val)}{val}{/snippet}