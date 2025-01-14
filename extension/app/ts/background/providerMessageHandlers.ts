import { ConnectedToSigner, InterceptedRequest, WalletSwitchEthereumChainReply } from '../utils/interceptor-messages'
import { EthereumAccountsReply, EthereumChainReply } from '../utils/wire-types'
import { changeActiveAddressAndChainAndResetSimulation } from './background'
import { sendPopupMessageToOpenWindows } from './backgroundUtils'
import { resolveSignerChainChange } from './windows/changeChain'

export function ethAccountsReply(port: browser.runtime.Port, request: InterceptedRequest) {
	if (!('params' in request.options)) return
	const signerAccounts = EthereumAccountsReply.parse(request.options.params)
	if ( port.sender?.tab?.id !== undefined ) {
		window.interceptor.websiteTabSignerStates.set(port.sender.tab.id, {
			signerAccounts: signerAccounts,
			signerChain: window.interceptor.signerChain,
		})
	}
	if (window.interceptor) {
		window.interceptor.signerAccounts = signerAccounts
	}

	// update active address if we are using signers address
	if (window.interceptor.settings?.useSignersAddressAsActiveAddress || window.interceptor.settings?.simulationMode === false) {
		changeActiveAddressAndChainAndResetSimulation(signerAccounts[0], 'noActiveChainChange')
	}
	sendPopupMessageToOpenWindows('popup_accounts_update', request.options.params )
}

async function changeSignerChain(port: browser.runtime.Port, signerChain: bigint ) {
	if ( port.sender?.tab?.id !== undefined ) {
		window.interceptor.websiteTabSignerStates.set(port.sender.tab.id, {
			signerAccounts: window.interceptor.signerAccounts,
			signerChain: signerChain,
		})
	}
	if (window.interceptor) {
		window.interceptor.signerChain = signerChain
	}

	// update active address if we are using signers address
	if ( !window.interceptor.settings?.simulationMode ) {
		return changeActiveAddressAndChainAndResetSimulation('noActiveAddressChange', signerChain)
	}
	sendPopupMessageToOpenWindows('popup_chain_update')
}

export function signerChainChanged(port: browser.runtime.Port, request: InterceptedRequest) {
	if (!('params' in request.options)) return
	const signerChain = EthereumChainReply.parse(request.options.params)[0]
	changeSignerChain(port, signerChain)
}

export function walletSwitchEthereumChainReply(port: browser.runtime.Port, request: InterceptedRequest) {
	const params = WalletSwitchEthereumChainReply.parse(request.options).params[0]
	resolveSignerChainChange({
		method: 'popup_changeChainDialog',
		options: {
			accept: params.accept
		}
	})
	if (params.accept) changeSignerChain(port, params.chainId )
}

export function connectedToSigner(_port: browser.runtime.Port, request: InterceptedRequest) {
	window.interceptor.signerName = ConnectedToSigner.parse(request.options).params[0]
	sendPopupMessageToOpenWindows('popup_signer_name_changed')
}
