import React, { useState } from 'react';
import ReactDOM from 'react-dom';

// console.log({ React, ReactDOM });

const App = ({ name }) => {
	const [num, setNum] = useState(0);
	// const caseA =
	// 	num % 2 === 0
	// 		? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
	// 		: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];

	// return <div onClick={() => setNum((pre) => pre + 1)}>{caseA}</div>;
	return (
		<h1
			onClick={() => {
				setNum((pre) => pre + 1);
				setNum((pre) => pre + 1);
				setNum((pre) => pre + 1);
			}}
			key="sibling-----1"
		>
			eiwnfiwufnuiwenf93f--------{num}
		</h1>
	);
};

ReactDOM.createRoot(document.querySelector('#root')).render(
	<div key="parent">
		<App name="lina" />
		<p key="sibling---2">windy</p>
	</div>
);
