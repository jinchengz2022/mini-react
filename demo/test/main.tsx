import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const App = ({ name }) => {
	const [num, setNum] = useState(0);

	useEffect(() => {
		console.log('app effect test');

		return () => {
			console.log('app unMount');
		};
	}, [num]);

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

	return <h2 key="child">child</h2>;
};

ReactDOM.createRoot(document.querySelector('#root')).render(
	<div key="parent">
		<App name="lina" />
	</div>
);
