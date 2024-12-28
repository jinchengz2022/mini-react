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
		<h3
			onClick={(e) => {
				// e.stopPropagation();
				setNum((pre) => pre + 1);
			}}
		>{`${name} --- ${num}`}</h3>
	);
};

ReactDOM.createRoot(document.querySelector('#root')).render(
	<div>
		<p>2</p>
		<p>3</p>
		<>
			<p>4</p>
			<p>5</p>
		</>
	</div>
);
