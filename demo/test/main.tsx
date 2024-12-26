import React, { useState } from 'react';
import ReactDOM from 'react-dom';

console.log({ React, ReactDOM });

const App = () => {
	const [num, setNum] = useState(0);
	const caseA =
		num % 2 === 0
			? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
			: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];

	return <div onClick={() => setNum((pre) => pre + 1)}>{caseA}</div>;
};
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
