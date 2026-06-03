<script>
	import Child from './Child.svelte';
</script>

<p {...await { class: 'cool'}}>cool</p>
<Child {...await { thing: 'beans' }} />

<p class={await 'awesome'}>awesome</p>
<Child thing={await 'sauce'} />

<p {...{}} class={await 'neato'}>neato</p>
<Child {...{}} thing={await 'burrito'} />
