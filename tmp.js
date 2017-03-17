import { createComment, insertNode, detachNode, teardownEach, createElement, addEventListener, removeEventListener, appendNode, createText, dispatchObservers, proto } from "/Users/rharris/Documents/www/SVELTE/svelte/shared.js"

function renderMainFragment ( root, component ) {
    var eachBlock_anchor = createComment();
    var eachBlock_value = root.values;
    var eachBlock_iterations = [];

    for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
        eachBlock_iterations[i] = renderEachBlock( root, eachBlock_value, eachBlock_value[i], i, component );
    }

    var text = createText( "\n\n" );

    var p = createElement( 'p' );

    var last_text1 = root.selected
    var text1 = createText( last_text1 );
    appendNode( text1, p );

    return {
        mount: function ( target, anchor ) {
            insertNode( eachBlock_anchor, target, anchor );

            for ( var i = 0; i < eachBlock_iterations.length; i += 1 ) {
                eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
            }

            insertNode( text, target, anchor );
            insertNode( p, target, anchor );
        },

        update: function ( changed, root ) {
            var __tmp;

            var eachBlock_value = root.values;

            for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
                if ( !eachBlock_iterations[i] ) {
                    eachBlock_iterations[i] = renderEachBlock( root, eachBlock_value, eachBlock_value[i], i, component );
                    eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
                } else {
                    eachBlock_iterations[i].update( changed, root, eachBlock_value, eachBlock_value[i], i );
                }
            }

            teardownEach( eachBlock_iterations, true, eachBlock_value.length );

            eachBlock_iterations.length = eachBlock_value.length;

            if ( ( __tmp = root.selected ) !== last_text1 ) {
                text1.data = last_text1 = __tmp;
            }
        },

        teardown: function ( detach ) {
            teardownEach( eachBlock_iterations, detach );

            if ( detach ) {
                detachNode( eachBlock_anchor );
                detachNode( text );
                detachNode( p );
            }
        }
    };
}

function renderEachBlock ( root, eachBlock_value, value, value__index, component ) {
    var label = createElement( 'label' );

    var input = createElement( 'input' );
    input.type = "checkbox";
    var last_input_value = value;
    input.value = input.__value = last_input_value;

    var input_updating = false;

    function inputChangeHandler () {
        input_updating = true;
        component._set({ selected: getBindingGroupValue( component._bindingGroups[0] ) });
        input_updating = false;
    }

    addEventListener( input, 'change', inputChangeHandler );

    appendNode( input, label );

    input.group = root.selected;

    appendNode( createText( " " ), label );
    var last_text1 = value
    var text1 = createText( last_text1 );
    appendNode( text1, label );

    return {
        mount: function ( target, anchor ) {
            insertNode( label, target, anchor );
        },

        update: function ( changed, root, eachBlock_value, value, value__index ) {
            var __tmp;

            if ( ( __tmp = value ) !== last_input_value ) {
                last_input_value = __tmp;
                input.value = input.__value = last_input_value;
            }

            if ( !input_updating ) {
                input.checked = root.selected.indexOf( last_input_value ) !== -1;
            }

            if ( ( __tmp = value ) !== last_text1 ) {
                text1.data = last_text1 = __tmp;
            }
        },

        teardown: function ( detach ) {
            removeEventListener( input, 'change', inputChangeHandler );

            if ( detach ) {
                detachNode( label );
            }
        }
    };
}

function SvelteComponent ( options ) {
    options = options || {};
    this._state = options.data || {};

    this._observers = {
        pre: Object.create( null ),
        post: Object.create( null )
    };

    this._handlers = Object.create( null );

    this._root = options._root;
    this._yield = options._yield;

    this._torndown = false;

    this._fragment = renderMainFragment( this._state, this );
    if ( options.target ) this._fragment.mount( options.target, null );
}

SvelteComponent.prototype = Object.assign( {}, proto );

SvelteComponent.prototype._set = function _set ( newState ) {
    var oldState = this._state;
    this._state = Object.assign( {}, oldState, newState );

    dispatchObservers( this, this._observers.pre, newState, oldState );
    if ( this._fragment ) this._fragment.update( newState, this._state );
    dispatchObservers( this, this._observers.post, newState, oldState );
};

SvelteComponent.prototype.teardown = SvelteComponent.prototype.destroy = function destroy ( detach ) {
    this.fire( 'destroy' );

    this._fragment.teardown( detach !== false );
    this._fragment = null;

    this._state = {};
    this._torndown = true;
};

export default SvelteComponent;