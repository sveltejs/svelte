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
	div:has(span){}
	div > :not(span){}
	div > :is(span){}
	div > :where(span){}

	div:has(:is(span)){}
	div > :not(:is(span)){}
	div > :is(:is(span)){}
	div > :where(:is(span)){}

	div{
		p:has(&){

		}
		:not(span > *){
			:where(form){}
		}
	}
</style>