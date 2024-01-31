<script>
    // needs to be a snapshot test because jsdom does auto-correct the attribute casing
    let x = $state('test');
    let y = $state(() => 'test');
</script>

<div fooBar={x}></div>
<svg viewBox={x}></svg>
<custom-element fooBar={x}></custom-element>

<!-- force them into singular render effects by using function invocations -->
<div fooBar={y()}></div>
<svg viewBox={y()} ></svg>
<custom-element fooBar={y()}></custom-element>
