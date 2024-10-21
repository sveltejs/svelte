<Component>
    unchanged
</Component>

<Component>
    unchanged
</Component>

<Component >
    {#snippet children({ foo })}
        <div>{foo}</div>
    {/snippet}
</Component>

<Component >
    {#snippet children({ foo: bar })}
        <div>{bar}</div>
    {/snippet}
</Component>

<Component >
    {#snippet children({ foo })}
        <div>{foo}</div>
    {/snippet}
</Component>

<Component>
    {#snippet named()}
        <div >x</div>
    {/snippet}
</Component>

<Component>
    {#snippet named()}
        <div >
            <p>multi</p>
            <p>line</p>
        </div>
    {/snippet}
</Component>

<Component>
    {#snippet named()}
        <svelte:element this={'div'} >x</svelte:element>
    {/snippet}
</Component>

<Component>
    {#snippet foo({ foo })}
        <div  >{foo}</div>
    {/snippet}
    {#snippet bar({ foo: bar })}
        <div  >{bar}</div>
    {/snippet}
</Component>

<Component >
    {#snippet children({ foo })}
        {foo}
        {/snippet}
    {#snippet named()}
        <div >x</div>
    {/snippet}
</Component>

<Component>
    {#snippet children({ foo })}
        {foo}
    {/snippet}
</Component>

<Component>
    {#snippet named({ foo })}
        {foo}
    {/snippet}
</Component>

<Component>
    {#snippet foo()}
        <div >foo</div>
    {/snippet}
    OMG WHY
    {#snippet bar()}
        <div >bar</div>
    {/snippet}
</Component>

<Component>
    If you do mix slots like this
    {#snippet foo()}
        <div >foo</div>
    {/snippet}
    you're a monster
    {#snippet bar()}
        <div >bar</div>
    {/snippet}
</Component>

<Component >
    {#snippet foo()}
        <div >foo</div>
    {/snippet}
    {#snippet children({ omg })}
        {omg} WHY
        {/snippet}
    {#snippet bar()}
        <div >bar</div>
    {/snippet}
</Component>

<Component >{#snippet children({ monster })}
    
        If you do mix slots like this
         
    you're a {monster}{/snippet}
    {#snippet foo()}
        <div >foo</div>
    {/snippet}
    {#snippet bar()}
        <div >bar</div>
    {/snippet}
</Component>

<Component>
	<span >should be children</span>
</Component>

<Component>
	<span  >{#snippet children({ with_prop })}
                should be children {with_prop} too            {/snippet}
        </span>
</Component>

<c-e>
    <div slot="named">unchanged</div>
</c-e>