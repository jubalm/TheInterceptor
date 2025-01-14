import { addressString } from '../../utils/bigint'
import { AddressMetadata, SimulatedAndVisualizedTransaction, SimulationAndVisualisationResults, TokenVisualizerResult, TransactionVisualizationParameters } from '../../utils/visualizer-types'
import { FromAddressToAddress, SmallAddress } from '../subcomponents/address'
import { Ether, Token, TokenText, TokenText721, ERC721Token } from '../subcomponents/coins'
import { CHAIN, LogAnalysisParams } from '../../utils/user-interface-types'
import { QUARANTINE_CODES_DICT } from '../../simulation/protectors/quarantine-codes'
import { Error } from '../subcomponents/Error'
import { identifyRoutes, identifySwap, SwapVisualization } from './SwapTransactions'
import { Erc20ApprovalChanges, ERC721OperatorChanges, ERC721TokenIdApprovalChanges } from './SimulationSummary'
import { identifyTransaction, nameTransaction } from './identifyTransaction'
import { makeYouRichTransaction } from './transactionExplainers'
import { JSXInternal } from 'preact/src/jsx'

function TransactionAggregate(
	param: {
		txs: SimulatedAndVisualizedTransaction[],
		simulationAndVisualisationResults: SimulationAndVisualisationResults,
		activeAddress: bigint,
	}
) {
	return ( <> {
		param.txs.map((tx, _index) => (
			<li>
				<div style = 'position: relative; z-index: 0;'>
					<div style = 'background-color: var(--disabled-card-color);' >
						<div class = 'block' style = 'background-color: var(--disabled-card-color); position: relative; z-index: -1;'>
							<header class = 'card-header'>
								<div class = 'card-header-icon unset-cursor'>
									<span class = 'icon'>
									<img src = { tx.multicallResponse.statusCode === 'success' ? ( tx.simResults && tx.simResults.quarantine ? '../img/warning-sign.svg' : '../img/success-icon.svg' ) : '../img/error-icon.svg' } />
									</span>
								</div>

								<p class = 'card-header-title'>
									<p className = 'paragraph'>
										{ nameTransaction(tx, param.simulationAndVisualisationResults.addressMetadata, param.activeAddress) }
									</p>
								</p>
							</header>
						</div>
					</div>
				</div>
			</li>
		))
	} </> )
}

function areThereImportantEventsToHighlight(tx: SimulatedAndVisualizedTransaction, _simulationAndVisualisationResults: SimulationAndVisualisationResults ) {
	const identifiedSwap = identifySwap(tx)
	if (identifiedSwap) return true
	const msgSender = tx.unsignedTransaction.from
	if (tx.simResults?.visualizerResults === undefined) return false

	// ether changes
	if (tx.simResults?.visualizerResults?.ethBalanceChanges.filter( (x) => x.address === msgSender && x.after !== x.before ).length > 0) return true

	// token changes
	return tx.simResults.visualizerResults.tokenResults.filter( (x) => x.from === msgSender || x.to === msgSender ).length > 0
}

function EtherTransferEvent(param: { valueSent: bigint, totalReceived: bigint, textColor: string, chain: CHAIN } ) {
	return <>
		{ param.valueSent === 0n ? <></> :
			<div class = 'vertical-center'>
				<div class = 'box token-box negative-box vertical-center' >
					<p style = {`color: ${ param.textColor }; margin-bottom: 0px`}> Send </p>
					<Ether
						amount = { param.valueSent }
						showSign = { false }
						textColor = { param.textColor }
						negativeColor = { param.textColor }
						chain = { param.chain }
					/>
				</div>
			</div>
		}
		{ param.totalReceived <= 0n ? <></> :
			<div class = 'vertical-center'>
				<div class = 'box token-box positive-box vertical-center'>
					<p style = {`color: ${ param.textColor }; margin-bottom: 0px`}> Receive </p>
					<Ether
						amount = { param.totalReceived }
						showSign = { false }
						textColor = { param.textColor }
						negativeColor = { param.textColor }
						chain = { param.chain }
					/>
				</div>
			</div>
		}
	</>
}

function SendOrReceiveTokensImportanceBox(param: { sending: boolean, tokenVisualizerResults: TokenVisualizerResult[] | undefined, addressMetadata: Map<string, AddressMetadata>, textColor: string } ) {
	if (param.tokenVisualizerResults === undefined) return <></>
	return <>
		{ param.tokenVisualizerResults.map( (tokenEvent) => (
			tokenEvent.isApproval ? <></> : <div class = 'vertical-center'>
				{ param.sending ?
					<div class = 'box token-box negative-box vertical-center'  >
						<p  style = {`color: ${ param.textColor }; margin-bottom: 0px`}> Send </p>
						{ tokenEvent.is721 ?
							<ERC721Token
								tokenId = { tokenEvent.tokenId }
								token = { tokenEvent.tokenAddress }
								addressMetadata = { param.addressMetadata.get(addressString(tokenEvent.tokenAddress)) }
								textColor = { param.textColor }
								useFullTokenName = { false }
								received = { false }
								showSign = { false }
							/> :
							<Token
								amount = { tokenEvent.amount }
								token = { tokenEvent.tokenAddress }
								showSign = { false }
								addressMetadata = { param.addressMetadata.get(addressString(tokenEvent.tokenAddress)) }
								textColor = { param.textColor }
								negativeColor = { param.textColor }
								useFullTokenName = { false }
							/>
						}

						<p style = { `color: ${ param.textColor }; margin-bottom: 0px; margin-right: 8px` }> to </p>
						<SmallAddress
							address = { tokenEvent.tokenAddress }
							addressMetaData = { param.addressMetadata.get(addressString(tokenEvent.tokenAddress)) }
							textColor = { param.textColor }
							downScale = { true }
						/>
					</div>
					:
					<div class = 'box token-box positive-box vertical-center'>
						<p style = { `color: ${ param.textColor }; margin-bottom: 0px;` }> Receive </p>
						{ tokenEvent.is721 ?
							<ERC721Token
								tokenId = { tokenEvent.tokenId }
								token = { tokenEvent.tokenAddress }
								addressMetadata = { param.addressMetadata.get(addressString(tokenEvent.tokenAddress)) }
								textColor = { param.textColor }
								useFullTokenName = { false }
								received = { true }
								showSign = { false }
							/> :
							<Token
								amount = { tokenEvent.amount }
								token = { tokenEvent.tokenAddress }
								showSign = { false }
								addressMetadata = { param.addressMetadata.get(addressString(tokenEvent.tokenAddress)) }
								textColor = { param.textColor }
								negativeColor = { param.textColor }
								useFullTokenName = { false }
							/>
						}
						<p style = { `color: ${ param.textColor }; margin-bottom: 0px; margin-right: 8px` }> from </p>
						<SmallAddress
							address = { tokenEvent.tokenAddress }
							addressMetaData = { param.addressMetadata.get(addressString(tokenEvent.tokenAddress)) }
							textColor = { param.textColor }
							downScale = { true }
						/>
					</div>
				}
				</div>
			))
		}
	</>
}

// showcases the most important things the transaction does
function TransactionImportanceBlock( param: { tx: SimulatedAndVisualizedTransaction, simulationAndVisualisationResults: SimulationAndVisualisationResults } ) {
	if ( param.tx.multicallResponse.statusCode === 'failure') return <></>
	const identifiedSwap = identifySwap(param.tx)
	const textColor =  'var(--text-color)'

	if(identifiedSwap) {
		return <SwapVisualization
			identifiedSwap = { identifiedSwap }
			addressMetadata = { param.simulationAndVisualisationResults.addressMetadata }
			chain = { param.simulationAndVisualisationResults.chain }
		/>
	}

	const msgSender = param.tx.unsignedTransaction.from

	const sendingTokenResults = param.tx.simResults?.visualizerResults?.tokenResults.filter( (x) => x.from === msgSender)
	const receivingTokenResults = param.tx.simResults?.visualizerResults?.tokenResults.filter( (x) => x.to === msgSender)

	// tokenApprovalChanges: Map<string, Map<string, bigint > > // token address, approved address, amount
	const tokenApprovalChanges: Map<string, Map<string, bigint > > = sendingTokenResults ? new Map( sendingTokenResults.filter( (x) => x.isApproval && !x.is721).map(
		(x) => [ addressString(x.tokenAddress), new Map( [ [ addressString(x.to), 'amount' in x ? x.amount : 0n ] ]  ) ]
	)) : new Map()

	// ERC721OperatorChanges: Map<string, string | undefined>
	const operatorChanges: Map<string, string | undefined> = sendingTokenResults ? new Map( sendingTokenResults.filter( (x) => x.isApproval && x.is721 && ('isAllApproval' in x && x.isAllApproval) ).map(
		(x) => [ addressString(x.tokenAddress), 'allApprovalAdded' in x && x.allApprovalAdded ? addressString(x.to) : undefined ]
	)) : new Map()

	// token address, tokenId, approved address
	const tokenIdApprovalChanges: Map<string, Map<string, string > > = sendingTokenResults ? new Map( sendingTokenResults.filter( (x) => x.isApproval && x.is721).map(
		(x) => [ addressString(x.tokenAddress), new Map( [ [ 'tokenId' in x ? x.tokenId : 0n, x.to ] ]  ) ]
	)) : new Map()

	const ownBalanceChanges = param.tx.simResults?.visualizerResults?.ethBalanceChanges.filter( (change) => change.address === msgSender)

	return <>
		{ /* sending ether / tokens */ }
		<EtherTransferEvent
			valueSent = { param.tx.signedTransaction.value }
			totalReceived = { ownBalanceChanges !== undefined && ownBalanceChanges.length > 0 ? ownBalanceChanges[ownBalanceChanges.length - 1].after - ownBalanceChanges[0].before : 0n  }
			textColor = { textColor }
			chain = { param.simulationAndVisualisationResults.chain }
		/>

		<SendOrReceiveTokensImportanceBox
			addressMetadata = { param.simulationAndVisualisationResults.addressMetadata }
			tokenVisualizerResults = { sendingTokenResults?.filter( (x) => !x.isApproval) }
			sending = { true }
			textColor = { textColor }
		/>

		{ /* us approving other addresses */ }
		<Erc20ApprovalChanges
			addressMetadata = { param.simulationAndVisualisationResults.addressMetadata }
			tokenApprovalChanges = { tokenApprovalChanges }
			textColor = { textColor }
			negativeColor = { textColor }
			isImportant = { true }
		/>
		<ERC721OperatorChanges
			addressMetadata = { param.simulationAndVisualisationResults.addressMetadata }
			ERC721OperatorChanges = { operatorChanges }
			textColor = { textColor }
			negativeColor = { textColor }
			isImportant = { true }
		/>
		<ERC721TokenIdApprovalChanges
			addressMetadata = { param.simulationAndVisualisationResults.addressMetadata }
			ERC721TokenIdApprovalChanges = { tokenIdApprovalChanges }
			textColor = { textColor }
			negativeColor = { textColor }
			isImportant = { true }
		/>

		{ /* receiving tokens */ }
		<SendOrReceiveTokensImportanceBox
			addressMetadata = { param.simulationAndVisualisationResults.addressMetadata }
			tokenVisualizerResults = { receivingTokenResults?.filter( (x) => !x.isApproval) }
			sending = { false }
			textColor = { textColor }
		/>
	</>
}

function normalTransaction(param: TransactionVisualizationParameters) {
	const identifiedSwap = identifySwap(param.tx)
	return (
		<div class = 'block' style = 'background-color: var(--card-bg-color);'>
			<header class = 'card-header'>
				<div class = 'card-header-icon unset-cursor'>
					<span class = 'icon'>
						<img src = { param.tx.multicallResponse.statusCode === 'success' ? ( param.tx.simResults && param.tx.simResults.quarantine ? '../img/warning-sign.svg' : '../img/success-icon.svg' ) : '../img/error-icon.svg' } />
					</span>
				</div>
				<p class = 'card-header-title'>
					<p className = 'paragraph'>
						{ nameTransaction(param.tx, param.simulationAndVisualisationResults.addressMetadata, param.activeAddress) }
					</p>
				</p>
				<button class = 'card-header-icon' aria-label = 'remove' onClick = { () => param.removeTransaction(param.tx.signedTransaction.hash) }>
					<span class = 'icon' style = 'color: var(--text-color);'> X </span>
				</button>
			</header>
			<div class = 'card-content'>
				{ param.tx.signedTransaction.to === null ? <>Contract deployment</> :
					<div class = 'container'>
						<div class = 'notification' style = { `${ areThereImportantEventsToHighlight(param.tx , param.simulationAndVisualisationResults) ? 'background-color: var(--unimportant-text-color); margin-bottom: 10px;' : 'background-color: unset;' } padding: 10px` } >
							<FromAddressToAddress
								from = { param.tx.signedTransaction.from }
								to = { param.tx.signedTransaction.to }
								fromAddressMetadata = { param.simulationAndVisualisationResults.addressMetadata.get(addressString(param.tx.signedTransaction.from)) }
								toAddressMetadata = { param.simulationAndVisualisationResults.addressMetadata.get(addressString(param.tx.signedTransaction.to)) }
								downScale = { false }
								isApproval = { false }
							/>
							<div class = 'content importance-box-content' >
								<TransactionImportanceBlock
									tx = { param.tx }
									simulationAndVisualisationResults = { param.simulationAndVisualisationResults }
								/>
								{ param.tx.simResults !== undefined ? <>
									{ param.tx.simResults.quarantineCodes.map( (code) => (
										<div style = 'padding-top: 10px'>
											<Error text = { QUARANTINE_CODES_DICT[code].label } />
										</div>
									)) }
									</> : <></>
								}
							</div>
						</div>
					</div>
				}
				{ param.tx.simResults !== undefined ?  <>
					<div class = 'container'>
						<div class = 'notification' style = 'background-color: unset; padding-right: 10px; padding-left: 10px; padding-top: 0px; padding-bottom: 0px;'>
							<LogAnalysis simulatedAndVisualizedTransaction = { param.tx } addressMetadata = { param.simulationAndVisualisationResults.addressMetadata } identifiedSwap = { identifiedSwap } />
						</div>
					</div>
				</> : <></> }
				{ param.tx.multicallResponse.statusCode !== 'success' ? <Error text = { `The transaction fails with error '${param.tx.multicallResponse.error}'` } /> : <></>}
				{ param.tx.realizedGasPrice > 0n ?
					<p className = 'paragraph vertical-center' style = 'color: var(--subtitle-text-color); flex-direction: row-reverse;'>
						<Ether
							amount = { param.tx.multicallResponse.gasSpent * param.tx.realizedGasPrice }
							textColor = { 'var(--subtitle-text-color)' }
							chain = { param.simulationAndVisualisationResults.chain }
						/>
						Gas fee:
					</p> : <></>
				}
			</div>
		</div>
	)
}

export const transactionExplainers = new Map<string, (param: TransactionVisualizationParameters) => JSXInternal.Element >([
	['MakeYouRichTransaction', makeYouRichTransaction],
])

function Transaction(param: TransactionVisualizationParameters) {
	const identifiedTransaction = identifyTransaction(param.tx, param.activeAddress)
	const handler = transactionExplainers.get(identifiedTransaction)
	if (handler === undefined) {
		return normalTransaction(param)
	}
	return handler(param)
}

export function Transactions(
	param: {
		simulationAndVisualisationResults: SimulationAndVisualisationResults,
		removeTransaction: (hash: bigint) => void,
		showOnlyOneAndAggregateRest?: boolean,
		activeAddress: bigint,
	}
) {
	if(param.showOnlyOneAndAggregateRest) {
		if (param.simulationAndVisualisationResults.simulatedAndVisualizedTransactions.length === 0) return <></>
		return (
			<ul>
				{ param.simulationAndVisualisationResults.simulatedAndVisualizedTransactions.length > 1 ?
					<TransactionAggregate
						txs = { param.simulationAndVisualisationResults.simulatedAndVisualizedTransactions.slice(0, -1) }
						simulationAndVisualisationResults = { param.simulationAndVisualisationResults }
						activeAddress = { param.activeAddress }
					/>
				: <></>}
				<li>
					<Transaction
						tx = { param.simulationAndVisualisationResults.simulatedAndVisualizedTransactions.at(-1)! }
						simulationAndVisualisationResults = { param.simulationAndVisualisationResults }
						removeTransaction = { param.removeTransaction }
						activeAddress = { param.activeAddress }
					/>
				</li>
			</ul>
		)
	}
	return <ul>
		{ param.simulationAndVisualisationResults.simulatedAndVisualizedTransactions.map((tx, _index) => (
			<li>
				<Transaction
					tx = { tx }
					simulationAndVisualisationResults = { param.simulationAndVisualisationResults }
					removeTransaction = { param.removeTransaction }
					activeAddress = { param.activeAddress }
				/>
			</li>
		)) }
	</ul>
}

export type TokenLogEventParams = {
	tokenVisualizerResult: TokenVisualizerResult
	addressMetadata: Map<string, AddressMetadata>
}
export function TokenLogEvent(params: TokenLogEventParams ) {
	const colors = {
		textColor: 'var(--disabled-text-color)',
		negativeColor: 'var(--negative-dim-color)'
	}
	const isNegativelog = params.tokenVisualizerResult.isApproval
		|| ('amount' in params.tokenVisualizerResult && params.tokenVisualizerResult.amount < 0n)
		|| ('isApproval' in params.tokenVisualizerResult && params.tokenVisualizerResult.isApproval )
	const textColor = isNegativelog ? colors.negativeColor : colors.textColor

	return <div class = 'columns is-mobile' style = 'margin-bottom: 0px;'>
		<div class = 'column log-column'>
			<SmallAddress
				address = { params.tokenVisualizerResult.from }
				addressMetaData = { params.addressMetadata.get(addressString(params.tokenVisualizerResult.from)) }
				downScale = { true }
				textColor = { textColor }
			/>
		</div>
		{ params.tokenVisualizerResult.isApproval ?
			<div class = 'column log-column' style = 'flex-basis: unset; flex-grow: unset;'>
				<p class = 'vertical-center' style = {`color: ${ colors.negativeColor };`}> Approve </p>
			</div>
			:
			<div class = 'column log-column' style = 'padding-right: 0px; padding-left: 0px; flex: none; align-self: center;'>
				<svg style = '' width = '24' height = '24' viewBox = '0 0 24 24'> <path fill = { colors.textColor } d = 'M13 7v-6l11 11-11 11v-6h-13v-10z'/> </svg>
			</div>
		}
		<div class = 'column log-column'>
			<SmallAddress
				address = { params.tokenVisualizerResult.to }
				addressMetaData = { params.addressMetadata.get(addressString(params.tokenVisualizerResult.to)) }
				downScale = { true}
				textColor = { textColor }
				/>
		</div>
		<div class = 'column log-column is-narrow'>
			{ params.tokenVisualizerResult.is721 ?
				<TokenText721
					visResult = { params.tokenVisualizerResult }
					addressMetadata = { params.addressMetadata.get(addressString(params.tokenVisualizerResult.tokenAddress)) }
					textColor = { colors.textColor }
					negativeColor = { colors.negativeColor }
					useFullTokenName = { false }
				/>
				: <TokenText
					isApproval = { params.tokenVisualizerResult.isApproval }
					amount = { params.tokenVisualizerResult.amount }
					tokenAddress = { params.tokenVisualizerResult.tokenAddress }
					addressMetadata = { params.addressMetadata.get(addressString(params.tokenVisualizerResult.tokenAddress)) }
					textColor = { colors.textColor }
					negativeColor = { colors.negativeColor }
					useFullTokenName = { false }
				/>
			}
		</div>
	</div>
}

function LogAnalysis(param: LogAnalysisParams) {
	if ( param.simulatedAndVisualizedTransaction?.simResults?.visualizerResults === undefined ) return <></>
	if ( param.simulatedAndVisualizedTransaction.simResults.visualizerResults.tokenResults.length === 0 ) return <></>
	const routes = identifyRoutes(param.simulatedAndVisualizedTransaction, param.identifiedSwap)
	return <> { routes ?
		routes.map( (tokenVisualizerResult) => (
			<TokenLogEvent
				tokenVisualizerResult = { tokenVisualizerResult }
				addressMetadata = { param.addressMetadata }
			/>
		))
	:
		param.simulatedAndVisualizedTransaction.simResults.visualizerResults.tokenResults.map( (tokenVisualizerResult) => (
			<TokenLogEvent
				tokenVisualizerResult = { tokenVisualizerResult }
				addressMetadata = { param.addressMetadata }
			/>
		))
	} </>
}
