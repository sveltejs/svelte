import * as assert from 'assert';
import { detach } from 'svelte/internal';

describe('dom', () => {
	describe('detach', () => {
		describe('when parentNode exists', () => {
			it('should detach the child from the parent', () => {
				const parent = document.createElement('div');
				const child = document.createElement('div');
				parent.appendChild(child);

				assert.equal(child.parentElement, parent);

				detach(child);

				assert.equal(child.parentElement, null);
			});
		});
		describe('when parentNode does not exist', () => {
			it('should not throw an exception', () => {
				const childWithoutParent = document.createElement('div');
        let error = null;

        try {
          detach(childWithoutParent);
        } catch (e) {
          error = e;
        }

				assert.equal(error, null);
			});
		});
	});
});
