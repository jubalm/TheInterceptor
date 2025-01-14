import { ethers } from 'ethers'
import { addressString } from '../../utils/bigint'
import { AddressMetadata } from '../../utils/visualizer-types'
import Blockie from './PreactBlocky'
import { AddressInfo } from '../../utils/user-interface-types'
import { CopyToClipboard } from './CopyToClipboard'
import { ChainSelector } from './ChainSelector'

export function findAddressInfo(addressToFind: bigint, addressInfos: readonly AddressInfo[]) {
	for (const info of addressInfos) {
		if (info.address === addressToFind) {
			return info
		}
	}
	return {
		name: ethers.utils.getAddress(addressString(addressToFind)),
		address: addressToFind,
		askForAddressAccess: true,
	}
}

export type BigAddressParamsWithChainSelector = {
	address: bigint
	title: string | undefined
	chainId: bigint
	changeActiveChain: (chainId: bigint) => void
}

export function BigAddressWithChainSelector(param: BigAddressParamsWithChainSelector) {
	const title = param.title === undefined ? ethers.utils.getAddress(addressString(param.address)): param.title
	const addrString = ethers.utils.getAddress(addressString(param.address))

	return <div class = 'media'>
		<div class = 'media-left'>
			<CopyToClipboard content = { addrString } copyMessage = 'Address copied!'>
				<figure class = 'image noselect nopointer'>
					<Blockie seed = { addressString(param.address).toLowerCase() } size = { 8 } scale = { 5 } />
				</figure>
			</CopyToClipboard>
		</div>

		<div class = 'media-content' style = 'overflow: visible;'>
			<ChainSelector currentChain = { param.chainId } changeChain = { (chainId: bigint) => { param.changeActiveChain(chainId) } }/>
			<CopyToClipboard content = { addrString } copyMessage = 'Address copied!'>
				<p class = 'subtitle is-5 noselect nopointer'>
					{ title }
				</p>
			</CopyToClipboard>
		</div>
	</div>
}

export type BigAddressParams = {
	address: bigint
	title?: string
	subtitle?: string
	noCopying?: boolean
}

export function BigAddress(params: BigAddressParams) {
	const title = params.title === undefined ? ethers.utils.getAddress(addressString(params.address)): params.title
	const addrString = ethers.utils.getAddress(addressString(params.address))
	const subTitle = params.subtitle === undefined && title != addrString ? addrString : params.subtitle

	return <div class = 'media'>
		<div class = 'media-left'>
			{ !params.noCopying ?
				<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
					<figure class = 'image noselect nopointer'>
						<Blockie seed = { addressString(params.address).toLowerCase() } size = { 8 } scale = { 5 } />
					</figure>
				</CopyToClipboard>
			:
				<figure class = 'image noselect nopointer'>
					<Blockie seed = { addressString(params.address).toLowerCase() } size = { 8 } scale = { 5 } />
				</figure>
			}
		</div>

		<div class = 'media-content' style = 'overflow-y: hidden;'>
			{ !params.noCopying ?
				<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
					<p class = 'title is-5 noselect nopointer'>
						{ title }
					</p>
				</CopyToClipboard>
			:
				<p class = 'title is-5 noselect nopointer'>
					{ title }
				</p>
			}
			{ !params.noCopying ?
				<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
					<p class = 'subtitle is-7 noselect nopointer'>
						{ subTitle === undefined ? '' : subTitle }
					</p>
				</CopyToClipboard>
			:
				<p class = 'subtitle is-7 noselect nopointer'>
					{ subTitle === undefined ? '' : subTitle }
				</p>
			}
		</div>
	</div>
}

export type ActiveAddressParams = {
	address: bigint
	title?: string
	subtitle?: string
	simulationMode: boolean
	changeActiveAddress: () => void
}

export function ActiveAddress(params: ActiveAddressParams) {
	const title = params.title === undefined ? ethers.utils.getAddress(addressString(params.address)): params.title
	const addrString = ethers.utils.getAddress(addressString(params.address))
	const subTitle = params.subtitle === undefined && title != addrString ? addrString : params.subtitle

	return <div class = 'media'>
		<div class = 'media-left'>
			<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
				<figure class = 'image noselect nopointer'>
					<Blockie seed = { addressString(params.address).toLowerCase() } size = { 8 } scale = { 5 } />
				</figure>
			</CopyToClipboard>
		</div>

		<div class = 'media-content' style = 'overflow-y: hidden;'>
			<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
				<p class = 'title is-5 noselect nopointer' style = 'text-overflow: ellipsis; white-space: nowrap;'>
					{ title }
				</p>
			</CopyToClipboard>
			<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
				<p class = 'subtitle is-7 noselect nopointer'>
					{ subTitle === undefined ? '' : subTitle }
				</p>
			</CopyToClipboard>
		</div>

		<div class = 'media-right'>
			<button className = 'button is-primary' disabled = { !params.simulationMode } onClick = { params.changeActiveAddress } >
				Change
			</button>
		</div>
	</div>
}

export type SmallAddressParams = {
	address: bigint,
	addressMetaData: AddressMetadata | undefined,
	downScale?: boolean,
	textColor?: string,
}

export function getAddressName(address: bigint, metadata: AddressMetadata | undefined) {
	if ( metadata === undefined ) return ethers.utils.getAddress(addressString(address))
	return metadata.name
}

export function SmallAddress(params: SmallAddressParams) {
	const name = getAddressName(params.address, params.addressMetaData)
	const isAddr = ethers.utils.isAddress(name)
	const subTitle = isAddr ? undefined : addressString(params.address)
	const textColor = params.textColor === undefined ? 'var(--text-color)' : params.textColor

	return <div class = 'media' style = 'border-top: 0px; margin-top: 0px; padding-top: 0px; margin-right: 5px'>
		<div class = 'media-left' style = 'margin-right: 5px'>
			<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!' >
				<figure class = 'image noselect nopointer' style = 'margin: 0px'>
					<Blockie seed = { addressString(params.address).toLowerCase() } size = { 8 } scale = { params.downScale ? 3 : 5 } />
				</figure>
			</CopyToClipboard>
		</div>
		<div class = 'media-content' style = 'overflow-y: hidden;'>
			<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
				<p class = 'title is-7 noselect nopointer' style = { `color: ${textColor};` } >
				{ name }
				</p>
			</CopyToClipboard>
			{ !params.downScale ?
				<CopyToClipboard content = { ethers.utils.getAddress(addressString(params.address)) } copyMessage = 'Address copied!'>
					<p class = 'subtitle is-7 noselect nopointer' style = { `color: ${textColor}` }>
						{ subTitle === undefined ? '' : subTitle }
					</p>
				</CopyToClipboard>
			: <></>}
		</div>
	</div>
}

export type FromAddressToAddressParams = {
	from: bigint
	to: bigint
	fromAddressMetadata: AddressMetadata | undefined
	toAddressMetadata: AddressMetadata | undefined
	downScale: boolean
	isApproval: boolean
}

export function FromAddressToAddress(params: FromAddressToAddressParams ) {
	return  <div class = 'columns is-mobile' style = 'margin-bottom: 0px;'>
		<div class = 'column' style = 'width: 47.5%; flex: none; padding-bottom: 0px;'>
			<SmallAddress address = { params.from } addressMetaData = { params.fromAddressMetadata } downScale = { params.downScale }/>
		</div>
		<div class = 'column' style = 'width: 5%; padding: 0px; align-self: center; flex: none;'>
			{ params.isApproval ? <img width = '24' src = { '../../img/access-hand-key-icon.svg' }></img> :
				<svg style = '' width = '24' height = '24' viewBox = '0 0 24 24'> <path fill = 'var(--text-color)' d = 'M13 7v-6l11 11-11 11v-6h-13v-10z'/> </svg>
			}
		</div>
		<div class = 'column' style = 'width: 47.5%; flex: none; padding-bottom: 0px;'>
			<SmallAddress address = { params.to } addressMetaData = { params.toAddressMetadata } downScale = { params.downScale }/>
		</div>
	</div>
}
