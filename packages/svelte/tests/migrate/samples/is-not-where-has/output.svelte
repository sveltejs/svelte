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