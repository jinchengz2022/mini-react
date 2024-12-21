import { Action, State } from 'shared/ReactTypes';

// [name, setName] = useState('wang')
// setName('li')
// setName((pre) => pre + 'haha')

// reactDOM.createRoot(rootElement).render(<App/>)
// fiberRootNode ⇆⇆⇆ hostRoot ⇆⇆⇆ app

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

export const createUpdate = <State>(action: Action<State>) => ({ action });

export const createUpdateQueue = <State>() => ({
	shared: { pending: null }
});

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

export const processUpdateQueue = <State>(
	baseState: State, // 初始 state
	pendingUpdate: Update<State> | null
): { memorizedState: State } => {
	const result = { memorizedState: baseState };

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			result.memorizedState = action(baseState);
		} else {
			result.memorizedState = action;
		}
	}

	return result;
};
