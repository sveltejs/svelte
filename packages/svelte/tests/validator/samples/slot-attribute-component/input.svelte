<Foo slot="foo">valid</Foo>
<Foo slot={foo}>valid</Foo>
<Foo>
    {#if true}
        <Foo slot="foo">valid</Foo>
        <Foo slot={foo}>valid</Foo>
    {/if}
</Foo>