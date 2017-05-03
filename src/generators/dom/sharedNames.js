import * as shared from '../../shared/index.js';

export const nameMap = new Map();
export const sharedMap = new Map();

Object.keys(shared).forEach( key => {
	const value = shared[ key ]; // eslint-disable-line import/namespace
	if ( typeof value === 'function' ) {
		nameMap.set( value.name, key );
	}
	sharedMap.set( key, value.toString() );
});
