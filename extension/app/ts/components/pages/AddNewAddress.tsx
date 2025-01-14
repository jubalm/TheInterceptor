import { ethers } from 'ethers'
import { useEffect, useState } from 'preact/hooks'
import { EthereumAddress } from '../../utils/wire-types'
import { Page, AddAddressParam, AddressInfo } from '../../utils/user-interface-types'
import Blockie from '../subcomponents/PreactBlocky'
import { Notice } from '../subcomponents/Error'
import { getIssueWithAddressString } from '../ui-utils'

export function AddNewAddress(param: AddAddressParam) {
	const [addressInput, setAddressInput] = useState<string | undefined>(undefined)
	const [nameInput, setNameInput] = useState<string | undefined>(undefined)
	const [askForAddressAccess, setAskForAddressAccess] = useState<boolean>(true)
	const [errorString, setErrorString] = useState<string | undefined>(undefined)

	function add() {
		if (addressInput === undefined) return
		if (!areInputValid()) return
		param.setAndSaveAppPage(Page.Home)
		const newAddressInfos = param.addressInfos.concat( [{
			name: nameInput ? nameInput: ethers.utils.getAddress(addressInput),
			address: EthereumAddress.parse(addressInput),
			askForAddressAccess: askForAddressAccess,
		}])
		browser.runtime.sendMessage( { method: 'popup_changeAddressInfos', options: newAddressInfos.map( (x) => AddressInfo.serialize(x) ) } )
		param.setAddressInfos(newAddressInfos)
		setAddress(undefined)
		setNameInput(undefined)
	}

	function createAndSwitch() {
		if (addressInput === undefined) return
		if (!areInputValid()) return
		const addressToSwitch = BigInt(addressInput)
		add()
		param.setActiveAddressAndInformAboutIt(addressToSwitch)
	}

	useEffect( () => {
		setAddress(param.addressInput)
		setNameInput(param.nameInput)
	}, [param.addressInput, param.nameInput])

	function areInputValid() {
		if (addressInput === undefined) return false
		if (!ethers.utils.isAddress(addressInput)) return false
		if (nameInput !== undefined && nameInput.length > 42) return false
		return true
	}

	function close() {
		param.setAndSaveAppPage(Page.Home)
	}

	function setAddress(input: string | undefined) {
		setAddressInput(input)

		if (input === undefined) return setErrorString(undefined)
		if (ethers.utils.isAddress(input)) return setErrorString(undefined)

		const issue = getIssueWithAddressString(input)
		if (issue === undefined) return setErrorString('Unknown issue.')
		return setErrorString(`${ issue }`)
	}

	return ( <>
		<div class = 'modal-background'> </div>
		<div class = 'modal-card'>
			<header class = 'modal-card-head card-header interceptor-modal-head window-header'>
				<div class = 'card-header-icon unset-cursor'>
					<span class = 'icon'>
						<img src = '../img/address-book.svg'/>
					</span>
				</div>
				<p class = 'card-header-title'>
					<p className = 'paragraph'>
					Add New Address
					</p>
				</p>
				<button class = 'card-header-icon' aria-label = 'close' onClick = { close }>
					<span class = 'icon' style = 'color: var(--text-color);'> X </span>
				</button>
			</header>
			<section class = 'modal-card-body' style = 'overflow: visible;'>
				<div class = 'card' style = 'margin: 10px;'>
					<div class = 'card-content'>
						<div class = 'media'>
							<div class = 'media-left'>
								<figure class = 'image'>
									{ addressInput && ethers.utils.isAddress(addressInput.trim()) ?
										<Blockie seed = { addressInput.trim().toLowerCase() } size = { 8 } scale = { 5 } />
									: <div style = 'background-color: var(--unimportant-text-color); width: 40px; height: 40px; border-radius: 5px;'/> }
								</figure>
							</div>

							<div class = 'media-content' style = 'overflow-y: unset; overflow-x: unset;'>
								<input className = 'input interceptorInput' type = 'text' value = { nameInput } placeholder = { addressInput === undefined || addressInput === '' ? 'Name of the address' : addressInput }
									onInput = { e => param.setNameInput((e.target as HTMLInputElement).value) }
									maxLength = { 42 }
								/>
								<input className = 'input interceptorInput' type = 'text' value = { addressInput } placeholder = { '0x0...' }
									onInput = { e => param.setAddressInput((e.target as HTMLInputElement).value) }
									style = { `color: ${ addressInput === undefined || ethers.utils.isAddress(addressInput.trim()) ? 'var(--text-color)' : 'var(--negative-color)' };` } />
								<label class = 'form-control'>
									<input type = 'checkbox' checked = { !askForAddressAccess } onInput = { e => { if (e.target instanceof HTMLInputElement && e.target !== null) { setAskForAddressAccess(!e.target.checked) } } } />
									Don't request for an access (unsecure)
								</label>
							</div>
						</div>
					</div>
				</div>
				<div style = 'padding: 10px; height: 50px'>
					{ errorString === undefined ? <></> :<Notice text = { errorString } /> }
				</div>
			</section>
			<footer class = 'modal-card-foot window-footer' style = 'border-bottom-left-radius: unset; border-bottom-right-radius: unset; border-top: unset; padding: 10px;'>
				<button class = 'button is-success is-primary' onClick = { createAndSwitch } disabled = { ! (areInputValid()) }> Create and switch</button>
				<button class = 'button is-success is-primary' onClick = { add } disabled = { ! (areInputValid()) }> Create </button>
				<button class = 'button is-primary' style = 'background-color: var(--negative-color)' onClick = { close }>Cancel</button>
			</footer>
		</div>
	</> )

}
