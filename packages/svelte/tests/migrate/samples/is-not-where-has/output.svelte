<script>
	function is(){}
	function where(){}
	function not(){}
	function has(){}

	// looks like css but it's not in style tag
	const x = {
		div:is(42),
		span:where(42),
		form:not(42),
		input:has(42),
	}
</script>

what if i'm talking about `:has()` in my blog?

```css
	:has(.is_cool)
```

<style lang="postcss">
	div:has(:global(span)){}
	div > :not(:global(span)){}
	div > :is(:global(span)){}
	div > :where(:global(span)){}

	div:has(:global(:is(span))){}
	div > :not(:global(:is(span))){}
	div > :is(:global(:is(span))){}
	div > :where(:global(:is(span))){}

	div{
		p:has(:global(&)){

		}
		:not(:global(span > *)){
			:where(:global(form)){}
		}
	}
</style>