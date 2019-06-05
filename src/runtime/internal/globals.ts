import { is_client } from './utils';

const { console, Error, Map, Object } = (is_client ? window : global) as { console, Error, Map, Object };

export { console, Error, Map, Object };
