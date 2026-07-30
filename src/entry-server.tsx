import { renderToString } from 'react-dom/server'
import App from './App'

/** Build-time entry: renders the single page to static HTML for prerendering. */
export function render() {
  return renderToString(<App />)
}
