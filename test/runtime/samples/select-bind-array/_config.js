const items = [ { id: 'a' }, { id: 'b' } ];

export default {
    'skip-ssr': true,

    data: {
        foo: 'b',
        items
    },

    test ( assert, component, target ) {
        const options = target.querySelectorAll( 'option' );

        assert.equal( options[0].selected, false );
        assert.equal( options[1].selected, true );

        component.set( { foo: items[0].id } );

        assert.equal( options[0].selected, true );
        assert.equal( options[1].selected, false );
    }
};
