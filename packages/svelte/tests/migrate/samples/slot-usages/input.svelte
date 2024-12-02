<Component>
    unchanged
</Component>

<svelte:component this={Component}>
    unchanged
</svelte:component>

<Component let:foo>
    <div>{foo}</div>
</Component>

<Component let:foo={bar}>
    <div>{bar}</div>
</Component>

<svelte:component this={Component} let:foo>
    <div>{foo}</div>
</svelte:component>

<Component>
    <div slot="named">x</div>
</Component>

<Component>
    <div slot="named">
        <p>multi</p>
        <p>line</p>
    </div>
</Component>

<Component>
    <svelte:element this={'div'} slot="named">x</svelte:element>
</Component>

<Component>
    <div slot="foo" let:foo>{foo}</div>
    <div slot="bar" let:foo={bar}>{bar}</div>
</Component>

<Component let:foo>
    {foo}
    <div slot="named">x</div>
</Component>

<Component>
    <svelte:fragment let:foo>{foo}</svelte:fragment>
</Component>

<Component>
    <svelte:fragment slot="named" let:foo>{foo}</svelte:fragment>
</Component>

<Component>
    <div slot="foo">foo</div>
    OMG WHY
    <div slot="bar">bar</div>
</Component>

<Component>
    If you do mix slots like this
    <div slot="foo">foo</div>
    you're a monster
    <div slot="bar">bar</div>
</Component>

<Component let:omg>
    <div slot="foo">foo</div>
    {omg} WHY
    <div slot="bar">bar</div>
</Component>

<Component let:monster>
    If you do mix slots like this
    <div slot="foo">foo</div>
    you're a {monster}
    <div slot="bar">bar</div>
</Component>

<Component>
	<span slot="default">should be children</span>
</Component>

<Component>
	<span slot="default" let:with_prop>should be children {with_prop} too</span>
</Component>

<c-e>
    <div slot="named">unchanged</div>
</c-e>
