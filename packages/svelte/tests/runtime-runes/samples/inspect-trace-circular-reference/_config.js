import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

export default test({
    compileOptions: {
        dev: true
    },

    test({ assert, logs }) {
        assert.deepEqual(normalise_trace_logs(logs), [
            { log: '$state', highlighted: true },
            { log: 'filesState.files', highlighted: false },
            { log: { id: 1, items: [{ id: 2, items: [{ id: 3 }, { id: 4 }] }] } },
            { log: '$state', highlighted: true },
            { log: 'filesState.files.items[0].parent', highlighted: false },
            { log: { id: 1, items: [{ id: 2, items: [{ id: 3 }, { id: 4 }] }] } },
            { log: '$state', highlighted: true },
            { log: 'filesState.files.items[0].parent.items[0]', highlighted: false },
            { log: { id: 2, items: [{ id: 3 }, { id: 4 }] } }
        ]);
    }
});
