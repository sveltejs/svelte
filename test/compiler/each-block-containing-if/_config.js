import * as assert from 'assert';

export default {
	test ( component, target ) {
		const items = component.get( 'items' );
		items.forEach( item => item.completed = false );

		component.set({ currentFilter: 'all' });

		assert.equal( target.innerHTML, `<ul><li>one</li><!--#if filter(item, currentFilter)--><li>two</li><!--#if filter(item, currentFilter)--><li>three</li><!--#if filter(item, currentFilter)--><!--#each items--></ul>` );
	}
};
