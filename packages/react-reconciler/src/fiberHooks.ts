import { Dispatcher, Disptach } from '../../react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
import sharedInternals from 'shared/internals';
import { FiberNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';

let workInProgressHook: Hook | null = null;
let currentlyRenderingFiber: FiberNode | null = null;

// 通用 hook 数据结构；usestate、useEffect、useref
interface Hook {
	memoizedState: any;
	// 对于state，保存update相关数据
	updateQueue: unknown;
	// 链表
	next: Hook | null;
}

const { currentDispatcher } = sharedInternals;

// 貌似treeShake错误将currentDispatcher相关逻辑删除，只能暴露副作用
// console.log(currentDispatcher);

export const renderWithHooks = (workInProgress: FiberNode) => {
	currentlyRenderingFiber = workInProgress;
	// 重置
	workInProgress.memoizedState = null;
	workInProgress.updateQueue = null;

	const current = workInProgress.alternate;
	if (current !== null) {
		console.error('还未实现update时renderWithHooks');
	} else {
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = workInProgress.type;
	const props = workInProgress.pendingProps;
	const children = Component(props);

	// 重置
	currentlyRenderingFiber = null;
	workInProgressHook = null;

	return children;
};

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};

function mountState<State>(
	initialState: (() => State) | State
): [State, Disptach<State>] {
	// 获取当前 usestate 对应的 hook 数据
	const hook = mountWorkInprogressHook();
	let memoizedState: State;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	hook.memoizedState = memoizedState;

	if (currentlyRenderingFiber === null) {
		console.error('mountState时currentlyRenderingFiber不存在');
	}

	// 更新队列
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;

	return [
		memoizedState,
		// @ts-ignore
		dispatchSetState.bind(null, currentlyRenderingFiber, queue)
	];
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

function mountWorkInprogressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	// mount 时第一个 hook
	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			console.error('mountWorkInprogressHook时currentlyRenderingFiber未定义');
		} else {
			currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
		}
	} else {
		// mount 时后续的  hook
		workInProgressHook = workInProgressHook.next = hook;
	}
	return workInProgressHook as Hook;
}
