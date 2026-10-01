import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './app.tsx';

const rootElement = document.querySelector<HTMLElement>('#root');
if (!rootElement) {
	throw new Error('Missing root element');
}

const root = createRoot(rootElement);
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
