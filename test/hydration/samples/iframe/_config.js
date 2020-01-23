export default {
	props: {
		done: false,
	},

	snapshot(target) {
		let domMutated;
		const mutationRecords = [];
		const mutationObserver = new global.window.MutationObserver(records => {
			Array.from(
				records
			).forEach(
				({ type, childList, target, attributes, addedNodes, removedNodes }) => {
					childList = Array.from(childList|| []).map(n => n.nodeName);
					addedNodes = Array.from(addedNodes|| []).map(n => n.nodeName);
					removedNodes = Array.from(removedNodes|| []).map(n => n.nodeName);
					mutationRecords.push({
						type,
						childList,
						target,
						attributes,
						addedNodes,
						removedNodes,
					});
				});
			domMutated && domMutated(mutationRecords);
		});
		mutationObserver.observe(target, { childList: true, subtree: true });
		mutationRecords.length = 0;
		const trigger = new Promise(resolve => (domMutated = resolve));

		return {
			mutationRecords,
			mutationObserver,
			trigger,
		};
	},

	async test(assert, target, snapshot, component, window) {
		component.$set({done:true});
		
		await snapshot.trigger;
		snapshot.mutationObserver.disconnect();

		const iframeMutations = snapshot.mutationRecords.filter(({addedNodes, removedNodes}) => {
			return addedNodes.includes('IFRAME')|| removedNodes.includes('IFRAME');
		});

		assert(iframeMutations.length === 0, 'iframe added/removed');
		// assert(false, 'test')

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<iframe title="test"></iframe>
				<span>done</span>
			</div>
		`
		);
	},
};
