import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { Lane } from './fiberLanes';

export interface Update<State> {
	action: Action<State>;
	lane: Lane;
	next: Update<any> | null;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

// 创建
export const createUpdate = <State>(action: Action<State>, lane: Lane) => {
	if (__DEV__) {
		console.log('创建update：', action);
	}
	return {
		action,
		lane,
		next: null
	};
};

// 插入
export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>,
	update: Update<Action>
) => {
	if (__DEV__) {
		console.log('将update插入更新队列：', update);
	}
	const pending = updateQueue.shared.pending;
	if (pending === null) {
		update.next = update;
	} else {
		update.next = pending.next;
		pending.next = update;
	}
	updateQueue.shared.pending = update;
};

// 初始化
export const createUpdateQueue = <Action>() => {
	const updateQueue: UpdateQueue<Action> = {
		shared: {
			pending: null
		},
		dispatch: null
	};
	return updateQueue;
};

// 消费
export const processUpdateQueue = <State>(
	baseState: State,
	updateQueue: UpdateQueue<State>,
	fiber: FiberNode,
	renderLane: Lane
): State => {
	if (updateQueue !== null) {
		const pending = updateQueue.shared.pending;
		const pendingUpdate = pending;
		updateQueue.shared.pending = null;

		if (pendingUpdate !== null) {
			const first = pendingUpdate.next;
			let pending = pendingUpdate.next as Update<any>;

			do {
				const updateLane = pending.lane;
				if (updateLane === renderLane) {
					const action = pendingUpdate.action;
					if (action instanceof Function) {
						baseState = action(baseState);
					} else {
						baseState = action;
					}
				} else {
					console.error('updateLane !== renderLane');
				}
				pending = pending.next as Update<any>;
			} while (pending !== first);
		}
	} else {
		console.error(fiber, 'processUpdateQueue时 updateQueue不存在');
	}
	return baseState;
};
