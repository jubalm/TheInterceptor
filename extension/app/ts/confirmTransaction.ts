import * as preact from 'preact'
import { ConfirmTransaction } from './components/pages/ConfirmTransaction'

function rerender() {
	const element = preact.createElement(ConfirmTransaction, {})
	preact.render(element, document.body)
}

rerender()
