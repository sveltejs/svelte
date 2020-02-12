<script>
	export let radio = 'radio2';
	export let check = ['check2'];
</script>

<input type='radio' bind:group={radio} value='radio1' {...{}}>
<input type='radio' bind:group={radio} value='radio2' {...{}}>
<input type='radio' bind:group={radio} value='radio3' {...{}}>

<input type='checkbox' bind:group={check} value='check1' {...{}}>
<input type='checkbox' bind:group={check} value='check2' {...{}}>
<input type='checkbox' bind:group={check} value='check3' {...{}}>
