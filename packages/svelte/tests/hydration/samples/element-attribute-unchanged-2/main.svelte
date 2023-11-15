<script>
    let foo = $state('bar');
    let spread = $state({class: 'bar', foo: 'bar'});
</script>

<div class="{foo}" {foo}></div>
<div {...spread}></div>
