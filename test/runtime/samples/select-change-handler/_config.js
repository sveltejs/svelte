export default {
    data: {
        options: [ { id: 'a' }, { id: 'b' }, { id: 'c' } ],
        selected: 'b'
    },

    test ( assert, component, target, window ) {
        const select = target.querySelector( 'select' );
        assert.equal( select.value, 'b' );

        const event = new window.Event( 'update' );

        select.value = 'c';
        select.dispatchEvent( event );

        assert.equal( select.value, 'c' );
        assert.equal( component.get( 'lastChangedTo' ), 'c' );
        assert.equal( component.get( 'selected' ), 'c' );

        component.destroy();
    }
};
