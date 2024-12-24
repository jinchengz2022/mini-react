import React, { useState } from 'react';
import ReactDOM from 'react-dom';

console.log({ React, ReactDOM });

const App = () => {
	const [num, setNum] = useState('hhhhh');
	return <div>{num}</div>;
};
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
