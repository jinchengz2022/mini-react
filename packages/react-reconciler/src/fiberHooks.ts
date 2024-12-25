import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import sharedInternals from 'shared/internals';
import { FiberNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	processUpdateQueue,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';

let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;
let currentlyRenderingFiber: FiberNode | null = null;
interface Hook {
	memorizedState: any;
	// 对于state，保存update相关数据
	updateQueue: unknown;
	next: Hook | null;
}

const { currentDispatcher } = sharedInternals;

export const renderWithHooks = (workInProgress: FiberNode) => {
	currentlyRenderingFiber = workInProgress;
	// 重置
	workInProgress.memorizedState = null;
	workInProgress.updateQueue = null;

	const current = workInProgress.alternate;
	if (current !== null) {
		currentDispatcher.current = HooksDispatcherOnUpdate;
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = workInProgress.type;
	const props = workInProgress.pendingProps;
	const children = Component(props);

	// 重置
	currentlyRenderingFiber = null;
	workInProgressHook = null;
	currentHook = null;

	return children;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	const hook = mountWorkInProgressHook();
	let memorizedState: State;
	if (initialState instanceof Function) {
		memorizedState = initialState();
	} else {
		memorizedState = initialState;
	}
	hook.memorizedState = memorizedState;
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;

	// @ts-ignore
	const dispatch = (queue.dispatch = dispatchSetState.bind(
		null,
		currentlyRenderingFiber as FiberNode,
		queue as any
	));

	return [memorizedState, dispatch];
}

function updateState<State>(): [State, Dispatch<State>] {
	const hook = updateWorkInProgressHook();
	const queue = hook.updateQueue as UpdateQueue<State>;
	const baseState = hook.memorizedState;

	// 缺少render阶段更新的处理逻辑

	hook.memorizedState = processUpdateQueue(
		baseState,
		queue,
		currentlyRenderingFiber as FiberNode
	);
	return [hook.memorizedState, queue.dispatch as Dispatch<State>];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	scheduleUpdateOnFiber(fiber);
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memorizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			console.error('mountWorkInprogressHook时currentlyRenderingFiber未定义');
		} else {
			currentlyRenderingFiber.memorizedState = workInProgressHook = hook;
		}
	} else {
		workInProgressHook = workInProgressHook.next = hook;
	}
	return workInProgressHook as Hook;
}

function updateWorkInProgressHook(): Hook {
	// 情况1:交互触发的更新，此时wipHook还不存在，复用 currentHook链表中对应的 hook 克隆 wipHook
	// 情况2:render阶段触发的更新，wipHook已经存在，使用wipHook
	let nextCurrentHook: Hook | null;
	let nextWorkInProgressHook: Hook | null;

	if (currentHook === null) {
		// 情况1 当前组件的第一个hook
		const current = (currentlyRenderingFiber as FiberNode).alternate;
		if (current !== null) {
			nextCurrentHook = current.memorizedState;
		} else {
			nextCurrentHook = null;
		}
	} else {
		nextCurrentHook = currentHook.next;
	}

	if (workInProgressHook === null) {
		// 情况2 当前组件的第一个hook
		nextWorkInProgressHook = (currentlyRenderingFiber as FiberNode)
			.memorizedState;
	} else {
		nextWorkInProgressHook = workInProgressHook.next;
	}

	if (nextWorkInProgressHook !== null) {
		// 针对情况2 nextWorkInProgressHook保存了当前hook的数据
		workInProgressHook = nextWorkInProgressHook;
		currentHook = nextCurrentHook;
	} else {
		// 针对情况1 nextCurrentHook保存了可供克隆的hook数据
		if (nextCurrentHook === null) {
			// 本次render当前组件执行的hook比之前多，举个例子：
			// 之前：hook1 -> hook2 -> hook3
			// 本次：hook1 -> hook2 -> hook3 -> hook4
			// 那到了hook4，nextCurrentHook就为null
			console.error(
				`组件${currentlyRenderingFiber?.type}本次执行的hook比上次多`
			);
		}
		currentHook = nextCurrentHook as Hook;
		const newHook: Hook = {
			memorizedState: currentHook.memorizedState,
			// 对于state，保存update相关数据
			updateQueue: currentHook.updateQueue,
			next: null
		};

		if (workInProgressHook === null) {
			(currentlyRenderingFiber as FiberNode).memorizedState =
				workInProgressHook = newHook;
		} else {
			workInProgressHook = workInProgressHook.next = newHook;
		}
	}
	return workInProgressHook as Hook;
}
