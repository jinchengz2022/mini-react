import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import { Container } from './hostConfig';
import { HostRoot } from './workTags';
import { scheduleUpdateOnFiber } from './workLoop';
import {
	createUpdate,
	enqueueUpdate,
	createUpdateQueue,
	UpdateQueue
} from './updateQueue';

export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue<ReactElementType>();
	return root;
}

// 将 react_element 节点作为 action 挂载到 root 的 updatequeue 中
export function updateContainer(
	element: ReactElementType,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElementType>(element);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType>,
		update
	);
	scheduleUpdateOnFiber(hostRootFiber);

	return element;
}
