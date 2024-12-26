import React, { useState } from 'react';
import ReactDOM from 'react-dom';

console.log({ React, ReactDOM });

const App = () => {
	const [num, setNum] = useState(22);

	return <div onClick={() => setNum((pre) => pre + 1)}>{num}</div>;
};
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
