import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const App = ({ name }) => {
	const [num, setNum] = useState(0);

	useEffect(() => {
		console.log('app111 effect test');

		return () => {
			console.log('app111 unMount');
		};
	}, [num]);

	useEffect(() => {
		console.log('app222 effect test');

		return () => {
			console.log('app222 unMount');
		};
	}, []);

	return (
		<div>
			<h1
				onClick={() => {
					setNum((pre) => pre + 1);
				}}
				key="father"
			>
				father --- {num}
			</h1>
			{num === 1 ? null : <Child />}
		</div>
	);
};

const Child = () => {
	useEffect(() => {
		console.log('child effect test');

		return () => {
			console.log('child unMount');
		};
	}, []);

	return (
		<div>
			<h2 key="child">child</h2>
			<LastChild />
		</div>
	);
};

const LastChild = () => {
	useEffect(() => {
		console.log('LastChild effect test');

		return () => {
			console.log('LastChild unMount');
		};
	}, []);
	return (
		<div>
			<p>pppppppppppppp</p>
			<p>pppppppppppppp</p>
			<Hhhhh />
		</div>
	);
};

const Hhhhh = () => {
	useEffect(() => {
		console.log('Hhhhh effect test');

		return () => {
			console.log('Hhhhh unMount');
		};
	}, []);
	return (
		<div>
			<p>Hhhhh</p>
			<p>Hhhhh</p>
		</div>
	);
};

ReactDOM.createRoot(document.querySelector('#root')).render(
	<div key="parent">
		<App name="lina" />
	</div>
);
