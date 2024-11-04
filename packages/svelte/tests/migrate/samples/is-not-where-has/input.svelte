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

	div:has(.class:is(span)){}
	div > :not(.class:is(span)){}
	div > :is(.class:is(span)){}
	div > :where(.class:is(span)){}

	div :has(.class:is(span:where(:focus))){}
	div :not(.class:is(span:where(:focus-within))){}
	div :is(.class:is(span:is(:hover))){}
	div :where(.class:is(span:has(* > *))){}
	div :is(.class:is(span:is(:hover)), .x){}

	div :has(    :global(.class:is(span:where(:focus)))){}
	div :not(:global(.class:is(span:where(:focus-within)))){}
	div :is(:global(.class:is(span:is(:hover)))){}
	div :where(:global(.class:is(span:has(* > *)))){}
	div :is(:global(.class:is(span:is(:hover)), .x)){}

	div{
		p:has(&){

		}
		:not(span > *){
			:where(form){}
		}
	}
</style>