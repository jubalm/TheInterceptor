import { ethers } from "ethers"
import { getTokenAmountsWorth } from "../../simulation/priceEstimator"
import { abs, addressString, bigintToDecimalString, bigintToRoundedPrettyDecimalString } from "../../utils/bigint"
import { CHAINS } from "../../utils/constants"
import { CHAIN } from "../../utils/user-interface-types"
import { AddressMetadata, TokenPriceEstimate, TokenVisualizerResult } from "../../utils/visualizer-types"
import { CopyToClipboard } from "./CopyToClipboard"

export type EtherParams = {
	amount: bigint
	showSign?: boolean
	textColor?: string
	negativeColor?: string
	useFullTokenName?: boolean
	chain: CHAIN
}

export type TokenParams = {
	amount: bigint
	token: bigint
	showSign?: boolean
	textColor?: string
	negativeColor?: string
	addressMetadata: AddressMetadata | undefined
	useFullTokenName: boolean
}

export type ERC72TokenParams = {
	tokenId: bigint
	token: bigint
	received: boolean
	textColor?: string
	sentTextColor?: string
	addressMetadata: AddressMetadata | undefined
	useFullTokenName: boolean
	showSign?: boolean
}

export type TokenData = {
	decimals: bigint | undefined
	name: string
	symbol: string
	logoURI: string
}

export function getTokenData(token: bigint, metadata: AddressMetadata | undefined) : TokenData {
	if (metadata === undefined) {
		return {
			decimals: undefined,
			name: `Token (${ ethers.utils.getAddress(addressString(token)) })`,
			symbol: '???',
			logoURI: '../../img/question-mark-sign.svg'
		}
	}
	return {
		decimals: 'decimals' in metadata ? metadata.decimals : undefined,
		name: metadata.name,
		symbol: 'symbol' in metadata ? metadata.symbol : '???',
		logoURI: 'logoURI' in metadata && metadata.logoURI !== undefined ? metadata.logoURI : '../../img/question-mark-sign.svg'
	}
}

export function Ether(param: EtherParams) {
	const positiveColor = param.textColor ? param.textColor : 'var(--text-color)'
	const negativeColor = param.negativeColor ? param.negativeColor : positiveColor
	const color = param.amount >= 0 ? positiveColor : negativeColor
	const sign = param.showSign ? (param.amount >= 0 ? ' + ' : ' - ') : ''
	return <div class = 'vertical-center'>
		<CopyToClipboard content = { bigintToDecimalString(abs(param.amount), 18n) } copyMessage = { `${ CHAINS[param.chain].currencyName } amount copied!` } >
			<p class = 'noselect nopointer tokentext' style = {`color: ${ color }; margin-right: 4px; margin-left: 4px;`}> {`${ sign }${ bigintToRoundedPrettyDecimalString(abs(param.amount), 18n) }` } </p>
		</CopyToClipboard>
		<img class = 'noselect nopointer vertical-center tokentext' style = 'height: 25px; width: 16px; margin-left: 4px;' src = '../../img/coins/ethereum.png'/>
		<p class = 'noselect nopointer vertical-center tokentext'  style = { `color: ${ color };` }> { param.useFullTokenName ? CHAINS[param.chain].currencyName : CHAINS[param.chain].currencyTicker } </p>
	</div>
}

export function TokenPrice(
	param: {
		textColor?: string,
		negativeColor?: string,
		amount: bigint,
		chain: CHAIN,
		tokenPriceEstimate: TokenPriceEstimate | undefined
	}
) {
	if ( param.tokenPriceEstimate === undefined ) return <></>
	const positiveColor = param.textColor ? param.textColor : 'var(--text-color)'
	const negativeColor = param.negativeColor ? param.negativeColor : positiveColor
	const color = param.amount >= 0 ? positiveColor : negativeColor
	const value = getTokenAmountsWorth(param.amount, param.tokenPriceEstimate)
	return <div class = 'vertical-center'>
		<CopyToClipboard content = { bigintToDecimalString(abs(value), 18n) } copyMessage = { `${ CHAINS[param.chain].currencyName } amount copied!` } >
			<p class = 'noselect nopointer tokentext' style = {`color: ${ color }; margin-right: 4px; margin-left: 4px;`}> {`(${ bigintToRoundedPrettyDecimalString(abs(value), 18n) }` } </p>
		</CopyToClipboard>
		<img class = 'noselect nopointer vertical-center tokentext' style = 'max-height: 25px; margin-left: 4px;' src = '../../img/coins/ethereum.png'/>
		<p class = 'noselect nopointer vertical-center tokentext'  style = { `color: ${ color };` }>
			{ `${CHAINS[param.chain].currencyTicker})` }
		</p>
	</div>
}


export function TokenSymbol(param: { token: bigint, textColor?: string, addressMetadata: AddressMetadata | undefined, useFullTokenName: boolean | undefined }) {
	const tokenData = getTokenData(param.token, param.addressMetadata)
	const tokenString = ethers.utils.getAddress(addressString(param.token))
	return <div class = 'vertical-center'>
		<CopyToClipboard content = { tokenString } copyMessage = 'Token address copied!' >
			<img class = 'noselect nopointer vertical-center tokentext' style = 'max-height: 25px; max-width: 25px; margin-left: 4px;' src = { tokenData.logoURI }/>
		</CopyToClipboard>
		<CopyToClipboard content = { tokenString } copyMessage = 'Token address copied!' >
			{ param.useFullTokenName ?
				<p class = 'noselect nopointer vertical-center tokentext' style = { `color: ${ param.textColor ? param.textColor : 'var(--text-color)' }; margin-right: 4px; word-break: break-word;` }>
					{ tokenData.name }
				</p>
			:
				<p class = 'noselect nopointer vertical-center tokentext' style = { `color: ${ param.textColor ? param.textColor : 'var(--text-color)' }; margin-right: 4px; white-space: nowrap;` }>
					{ tokenData.symbol }
				</p>
			}
		</CopyToClipboard>
	</div>
}

export function Token(param: TokenParams) {
	const positiveColor = param.textColor ? param.textColor : 'var(--text-color)'
	const negativeColor = param.negativeColor ? param.negativeColor : positiveColor
	const decimals = param.addressMetadata && 'decimals' in param.addressMetadata ? param.addressMetadata.decimals : undefined
	const color = param.amount >= 0 ? positiveColor : negativeColor
	const sign = param.showSign ? (param.amount >= 0 ? ' + ' : ' - '): ''

	if(decimals === undefined) {
		return <div class = 'vertical-center'>
			<p class = 'vertical-center tokentext' style = {`display: inline; color: ${ color }; margin-right: 4px; margin-left: 4px; white-space: nowrap;`}> Unknown Amount </p>
			<TokenSymbol token = { param.token } addressMetadata = { param.addressMetadata } textColor = { color } useFullTokenName = { param.useFullTokenName }/>
		</div>
	}
	return <div class = 'vertical-center'>
		<CopyToClipboard content = { bigintToDecimalString(abs(param.amount), decimals) } copyMessage = 'Token amount copied!' >
			<p class = 'vertical-center noselect nopointer tokentext' style = { `display: inline; color: ${ color }; margin-right: 4px; margin-left: 4px; white-space: nowrap;`}> { `${ sign }${ bigintToRoundedPrettyDecimalString(abs(param.amount), decimals ) }` } </p>
		</CopyToClipboard>
		<TokenSymbol token = { param.token } addressMetadata = { param.addressMetadata } textColor = { color } useFullTokenName = { param.useFullTokenName }/>
	</div>
}

function truncate(str: string, n: number){
	return (str.length > n) ? `${str.slice(0, n-1)}…` : str;
}

export function ERC721Token(param: ERC72TokenParams) {
	const positiveColor = param.textColor ? param.textColor : 'var(--text-color)'
	const negativeColor = param.sentTextColor ? param.sentTextColor : positiveColor
	const color = param.received ? positiveColor : negativeColor
	const sign = param.showSign ? (param.received ? ' + ' : ' - ') : ''
	return <div class = 'vertical-center'>
		<CopyToClipboard content = { param.tokenId.toString() } copyMessage = 'Token ID copied!' >
			<p class = 'vertical-center noselect nopointer tokentext' style = {`display: inline; color: ${ color }; margin-right: 4px; margin-left: 4px; white-space: nowrap;`}>
				{`${ sign } NFT #${ truncate(param.tokenId.toString(), 9) }`}
			</p>
		</CopyToClipboard>
		<TokenSymbol token = { param.token } addressMetadata = { param.addressMetadata } textColor = { color } useFullTokenName = { param.useFullTokenName }/>
	</div>
}

export function TokenText(param: { useFullTokenName: boolean, isApproval: boolean, amount: bigint, tokenAddress: bigint, addressMetadata: AddressMetadata | undefined, textColor: string, negativeColor: string }) {
	return <>
		{ param.isApproval ? (
			param.amount > 2n ** 100n ?
					<p class = 'vertical-center tokentext' style = { `display: inline-flex; margin-bottom: 0px; color: ${ param.negativeColor }; white-space: nowrap;` } >
						for ALL
						<TokenSymbol token = { param.tokenAddress } addressMetadata = { param.addressMetadata } textColor = { param.negativeColor }  useFullTokenName = { param.useFullTokenName }/>
					</p>
				: <p class = 'vertical-center tokentext' style = { `display: inline-flex; margin-bottom: 0px; color: ${ param.negativeColor }; white-space: nowrap;` } >
					for
					<Token amount = { param.amount } token = { param.tokenAddress } addressMetadata = { param.addressMetadata } textColor = { param.negativeColor } useFullTokenName = { param.useFullTokenName }/>
				</p>
			) : <p class = 'vertical-center tokentext' style = { `display: inline-flex; margin-bottom: 0px; color: ${ param.textColor }; white-space: nowrap;` } >
				for
				<Token amount = { param.amount } token = { param.tokenAddress } addressMetadata = { param.addressMetadata } textColor = { param.textColor } useFullTokenName = { param.useFullTokenName }/>
			</p>
		}
	</>
}
export function TokenText721(param: { useFullTokenName: boolean, visResult: TokenVisualizerResult, addressMetadata: AddressMetadata | undefined, textColor: string, negativeColor: string } ) {
	if (param.visResult.is721 !== true) throw `needs to be erc721`

	return <div class = 'vertical-center'>
		<p class = 'vertical-center tokentext' style = { `color: ${ param.visResult.isApproval ? param.negativeColor : param.textColor };` } > { param.visResult.isApproval ? (
				'isAllApproval' in param.visResult ? ( param.visResult.allApprovalAdded ? `Set as Operator` : `Remove Operator`)
					: `Approve NFT #${ truncate(param.visResult.tokenId.toString(), 9) }`
				) : `for NFT #${ truncate(param.visResult.tokenId.toString(), 9) }`
		}
			<TokenSymbol
				token = { param.visResult.tokenAddress }
				addressMetadata = { param.addressMetadata }
				textColor = { param.visResult.isApproval ? param.negativeColor : param.textColor }
				useFullTokenName = { param.useFullTokenName }
			/>
		</p>
	</div>
}
