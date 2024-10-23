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