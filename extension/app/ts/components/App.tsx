import { useState, useEffect } from 'preact/hooks'
import { defaultAddresses, WebsiteAccess } from '../background/settings'
import { addressString } from '../utils/bigint'
import { AddressMetadata, SimulatedAndVisualizedTransaction, SimulationAndVisualisationResults } from '../utils/visualizer-types'
import { AddressList } from './pages/AddressList'
import { ChangeActiveAddress } from './pages/ChangeActiveAddress'
import { Home } from './pages/Home'
import { Page, AddressInfo } from '../utils/user-interface-types'
import Hint from './subcomponents/Hint'
import { AddNewAddress } from './pages/AddNewAddress'
import { InterceptorAccessList } from './pages/InterceptorAccessList'
import { ethers } from 'ethers'
import { PasteCatcher } from './subcomponents/PasteCatcher'
import { truncateAddr } from '../utils/ethereum'
import { NotificationCenter } from './pages/NotificationCenter'
import { ICON_NOT_ACTIVE } from '../utils/constants'
import { SignerName } from '../utils/interceptor-messages'
import { EthereumQuantity } from '../utils/wire-types'
import { version, gitCommitSha } from '../version'

export function App() {
	const [appPage, setAppPage] = useState(Page.Home)
	const [makeMeRich, setMakeMeRich] = useState(false)
	const [addressInfos, setAddressInfos] = useState<readonly AddressInfo[]>(defaultAddresses)
	const [signerAccounts, setSignerAccounts] = useState<readonly bigint[] | undefined>(undefined)
	const [activeSimulationAddress, setActiveSimulationAddress] = useState<bigint | undefined>(undefined)
	const [activeSigningAddress, setActiveSigningAddress] = useState<bigint | undefined>(undefined)
	const [useSignersAddressAsActiveAddress, setUseSignersAddressAsActiveAddress] = useState(false)
	const [simVisResults, setSimVisResults] = useState<SimulationAndVisualisationResults | undefined >(undefined)
	const [websiteAccess, setWebsiteAccess] = useState<readonly WebsiteAccess[] | undefined>(undefined)
	const [websiteAccessAddressMetadata, setWebsiteAccessAddressMetadata] = useState<[string, AddressMetadata][]>([])
	const [activeChain, setActiveChain] = useState<bigint>(1n)
	const [addressInput, setAddressInput] = useState<string | undefined>(undefined)
	const [nameInput, setNameInput] = useState<string | undefined>(undefined)
	const [simulationMode, setSimulationMode] = useState<boolean>(true)
	const [notificationBadgeCount, setNotificationBadgeCount] = useState<number>(0)
	const [tabIcon, setTabIcon] = useState<string>( ICON_NOT_ACTIVE )
	const [tabApproved, setTabApproved] = useState<boolean>(false)
	const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false)
	const [currentBlockNumber, setCurrentBlockNumber] = useState<bigint | undefined>(undefined)
	const [signerName, setSignerName] = useState<SignerName | undefined>(undefined)

	function fetchSettings(backgroundPage: Window) {
		const settings = backgroundPage.interceptor.settings
		if ( settings === undefined ) throw `failed to fetch settings`
		setActiveSimulationAddress(settings.activeSimulationAddress)
		setActiveSigningAddress(settings.activeSigningAddress)
		setUseSignersAddressAsActiveAddress(settings.useSignersAddressAsActiveAddress)
		setAddressInfos(settings.addressInfos)
		setAppPage(settings.page)
		setMakeMeRich(settings.makeMeRich)
		setWebsiteAccess(settings.websiteAccess)
		setWebsiteAccessAddressMetadata(backgroundPage.interceptor.websiteAccessAddressMetadata)
		setActiveChain(settings.activeChain)
		setSimulationMode(settings.simulationMode !== undefined ? settings.simulationMode : true)
		setNotificationBadgeCount(settings.pendingAccessRequests.length)
	}

	async function setActiveAddressAndInformAboutIt(address: bigint | 'signer') {
		setUseSignersAddressAsActiveAddress(address === 'signer')
		if( address === 'signer' ) {
			browser.runtime.sendMessage( { method: 'popup_changeActiveAddress', options: 'signer' } );
			if(simulationMode) {
				return setActiveSimulationAddress(signerAccounts && signerAccounts.length > 0 ? signerAccounts[0] : undefined)
			}
			return setActiveSigningAddress(signerAccounts && signerAccounts.length > 0 ? signerAccounts[0] : undefined)
		}
		browser.runtime.sendMessage( { method: 'popup_changeActiveAddress', options: addressString(address) } );
		if(simulationMode) {
			return setActiveSimulationAddress(address)
		}
		return setActiveSigningAddress(address)
	}

	function isSignerConnected() {
		return signerAccounts !== undefined && signerAccounts.length > 0
			&& (
				simulationMode && activeSimulationAddress !== undefined && signerAccounts[0] === activeSimulationAddress
				|| !simulationMode && activeSigningAddress !== undefined && signerAccounts[0] === activeSigningAddress
			)
	}

	async function setActiveChainAndInformAboutIt(chainId: bigint) {
		browser.runtime.sendMessage( { method: 'popup_changeActiveChain', options: EthereumQuantity.serialize(chainId) } );
		if(!isSignerConnected()) {
			setActiveChain(chainId)
		}
	}

	function fetchSimulationState(backgroundPage: Window) {
		if (backgroundPage.interceptor.simulation.simulationState === undefined) return setSimVisResults(undefined)
		if (backgroundPage.interceptor.settings?.activeSimulationAddress === undefined) return setSimVisResults(undefined)

		const txs: SimulatedAndVisualizedTransaction[] = backgroundPage.interceptor.simulation.simulationState.simulatedTransactions.map( (x, index) => ({
			...x,
			simResults: backgroundPage.interceptor.simulation.visualizerResults === undefined ? undefined : backgroundPage.interceptor.simulation.visualizerResults[index],
		}) )

		setSimVisResults( {
			blockNumber: backgroundPage.interceptor.simulation.simulationState.blockNumber,
			blockTimestamp: backgroundPage.interceptor.simulation.simulationState.blockTimestamp,
			simulationConductedTimestamp: backgroundPage.interceptor.simulation.simulationState.simulationConductedTimestamp,
			simulatedAndVisualizedTransactions: txs,
			addressMetadata: new Map(backgroundPage.interceptor.simulation.addressMetadata.map( (x) => [x[0], x[1]])),
			chain: backgroundPage.interceptor.simulation.simulationState.chain,
			tokenPrices: backgroundPage.interceptor.simulation.tokenPrices,
			activeAddress: BigInt(backgroundPage.interceptor.settings.activeSimulationAddress),
			simulationMode: backgroundPage.interceptor.settings.simulationMode,
			isComputingSimulation: backgroundPage.interceptor.simulation.isComputingSimulation,
		})
	}

	async function updateState() {
		const backgroundPage = await browser.runtime.getBackgroundPage()
		fetchSettings(backgroundPage)
		fetchSimulationState(backgroundPage)
		setSignerName(backgroundPage.interceptor.signerName)
		setTabIcon( ICON_NOT_ACTIVE )
		setCurrentBlockNumber(backgroundPage.interceptor.currentBlockNumber)
		const tabs = await browser.tabs.query({ active: true, currentWindow: true })
		if (tabs.length === 0 || tabs[0].id === undefined ) return
		const signerState = backgroundPage.interceptor.websiteTabSignerStates.get(tabs[0].id)
		if (signerState) setSignerAccounts(signerState.signerAccounts)
		const conn = backgroundPage.interceptor.websiteTabIcons.get(tabs[0].id)
		if ( conn ) setTabIcon(conn)
		setTabApproved(backgroundPage.interceptor.websiteTabApprovals.get(tabs[0].id)?.approved === true)
		setIsSettingsLoaded(true)
	}

	useEffect(  () => {
		updateState()

		async function popupMessageListener(msg: unknown) {
			console.log('popup message')
			console.log(msg)
			updateState()
		}

		browser.runtime.onMessage.addListener(popupMessageListener)

		return () => {
			browser.runtime.onMessage.removeListener(popupMessageListener)
		}
	}, [])

	function setAndSaveAppPage(page: Page) {
		setAppPage(page)
		browser.runtime.sendMessage( { method: 'popup_changePage', options: page } );
	}

	async function addressPaste(address: string) {
		if (appPage === Page.AddNewAddress) return

		const trimmed = address.trim()
		if ( !ethers.utils.isAddress(trimmed) ) return

		const integerRepresentatio = BigInt(trimmed)
		// see if we have that address, if so, let's switch to it
		for (const addressInfo of addressInfos) {
			if ( addressInfo.address === integerRepresentatio) {
				return await setActiveAddressAndInformAboutIt(addressInfo.address)
			}
		}

		// address not found, let's promt user to create it
		const addressString = ethers.utils.getAddress(trimmed)
		setAndSaveAppPage(Page.AddNewAddress)
		setNameInput(`Pasted ${ truncateAddr(addressString) }`)
		setAddressInput(addressString)
	}
	return (
		<main style = { `background-color: var(--bg-color); width: 520px; height: 600px; ${ appPage !== Page.Home ? 'overflow: hidden;' : 'overflow: auto;' }` }>
			<PasteCatcher enabled = { appPage === Page.Home } onPaste = { addressPaste } />
			{ !isSettingsLoaded ? <></> : <>
				<Hint>
					<nav class = 'navbar window-header' role = 'navigation' aria-label = 'main navigation'>
						<div class = 'navbar-brand'>
							<a class = 'navbar-item' style = 'cursor: unset'>
								<img src = '../img/LOGOA.svg' alt = 'Logo' width = '32'/>
								<p style = 'color: #FFFFFF; padding-left: 5px;'>THE INTERCEPTOR
									<span style = 'color: var(--unimportant-text-color);' > { ` alpha ${ version } - ${ gitCommitSha.slice(0, 8) }`  } </span>
								</p>
							</a>
							<a class = 'navbar-item' style = 'margin-left: auto; margin-right: 0;'>
								<img src = '../img/internet.svg' width = '32' onClick = { () => setAndSaveAppPage(Page.AccessList) }/>
								<img src = '../img/address-book.svg' width = '32' onClick = { () => setAndSaveAppPage(Page.AddressList) }/>
								<div>
									<img src = '../img/notification-bell.svg' width = '32' onClick = { () => setAndSaveAppPage(Page.NotificationCenter) }/>
									{ notificationBadgeCount <= 0 ? <> </> : <span class = 'badge' style = 'transform: translate(-75%, 75%);'> { notificationBadgeCount } </span> }
								</div>
							</a>
						</div>
					</nav>
					<Home
						setActiveChainAndInformAboutIt = { setActiveChainAndInformAboutIt }
						activeChain = { activeChain }
						simVisResults = { simVisResults }
						useSignersAddressAsActiveAddress = { useSignersAddressAsActiveAddress }
						activeSigningAddress = { activeSigningAddress }
						activeSimulationAddress = { activeSimulationAddress }
						signerAccounts = { signerAccounts }
						setAndSaveAppPage = { setAndSaveAppPage }
						makeMeRich = { makeMeRich }
						addressInfos = { addressInfos }
						simulationMode = { simulationMode }
						tabIcon = { tabIcon }
						tabApproved = { tabApproved }
						currentBlockNumber = { currentBlockNumber }
						signerName = { signerName }
					/>

					<div class = { `modal ${ appPage !== Page.Home ? 'is-active' : ''}` }>
						{ appPage === Page.NotificationCenter ?
							<NotificationCenter
								setAndSaveAppPage = { setAndSaveAppPage }
							/>
						: <></> }
						{ appPage === Page.AccessList ?
							<InterceptorAccessList
								setAndSaveAppPage = { setAndSaveAppPage }
								setWebsiteAccess = { setWebsiteAccess }
								websiteAccess = { websiteAccess }
								websiteAccessAddressMetadata = { websiteAccessAddressMetadata }
							/>
						: <></> }
						{ appPage === Page.AddressList ?
							<AddressList
								setAddressInfos = { setAddressInfos }
								setAndSaveAppPage = { setAndSaveAppPage }
								addressInfos = { addressInfos }
							/>
						: <></> }
						{ appPage === Page.ChangeActiveAddress ?
							<ChangeActiveAddress
								setActiveAddressAndInformAboutIt = { setActiveAddressAndInformAboutIt }
								signerAccounts = { signerAccounts }
								setAndSaveAppPage = { setAndSaveAppPage }
								addressInfos = { addressInfos }
								signerName = { signerName }
							/>
						: <></> }
						{ appPage === Page.AddNewAddress ?
							<AddNewAddress
								setActiveAddressAndInformAboutIt = { setActiveAddressAndInformAboutIt }
								addressInput = { addressInput }
								nameInput = { nameInput }
								setAddressInput = { setAddressInput }
								setNameInput = { setNameInput }
								setAndSaveAppPage = { setAndSaveAppPage }
								addressInfos = { addressInfos }
								setAddressInfos = { setAddressInfos }
							/>
						: <></> }
					</div>

				</Hint>
			</> }
		</main>
	)
}
