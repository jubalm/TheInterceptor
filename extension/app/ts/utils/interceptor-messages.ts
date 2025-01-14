import * as funtypes from 'funtypes'
import { AddressInfo } from './user-interface-types'
import { EthereumAddress, EthereumQuantity } from './wire-types'

export type InterceptedRequest = funtypes.Static<typeof InterceptedRequest>
export const InterceptedRequest = funtypes.Object({
	interceptorRequest: funtypes.Boolean,
	usingInterceptorWithoutSigner: funtypes.Boolean,
	requestId: funtypes.Number,
	options: funtypes.Union(
		funtypes.Object({
			method: funtypes.String,
			params: funtypes.Union(funtypes.Array(funtypes.Unknown), funtypes.Undefined)
		}).asReadonly(), funtypes.Object({ method: funtypes.String }).asReadonly()
	),
}).asReadonly()

export type TransactionConfirmation = funtypes.Static<typeof TransactionConfirmation>
export const TransactionConfirmation = funtypes.Object({
	method: funtypes.Literal('popup_confirmDialog'),
	options: funtypes.Object({
		request: InterceptedRequest,
		accept: funtypes.Boolean
	})
}).asReadonly()

export type PersonalSign = funtypes.Static<typeof PersonalSign>
export const PersonalSign = funtypes.Object({
	method: funtypes.Literal('popup_personalSign'),
	options: funtypes.Object({
		request: InterceptedRequest,
		accept: funtypes.Boolean
	})
}).asReadonly()

export type InterceptorAccess = funtypes.Static<typeof InterceptorAccess>
export const InterceptorAccess = funtypes.Object({
	method: funtypes.Literal('popup_interceptorAccess'),
	options: funtypes.Object({
		accept: funtypes.Boolean
	})
}).asReadonly()

export type ChangeActiveAddress = funtypes.Static<typeof ChangeActiveAddress>
export const ChangeActiveAddress = funtypes.Object({
	method: funtypes.Literal('popup_changeActiveAddress'),
	options: funtypes.Union(EthereumAddress, funtypes.Literal('signer')),
}).asReadonly()

export type ChangeMakeMeRich = funtypes.Static<typeof ChangeMakeMeRich>
export const ChangeMakeMeRich = funtypes.Object({
	method: funtypes.Literal('popup_changeMakeMeRich'),
	options: funtypes.Boolean
}).asReadonly()

export type ChangeAddressInfos = funtypes.Static<typeof ChangeAddressInfos>
export const ChangeAddressInfos = funtypes.Object({
	method: funtypes.Literal('popup_changeAddressInfos'),
	options: funtypes.ReadonlyArray(AddressInfo)
}).asReadonly()

export type ChangePage = funtypes.Static<typeof ChangePage>
export const ChangePage = funtypes.Object({
	method: funtypes.Literal('popup_changePage'),
	options: funtypes.Number
}).asReadonly()

export type RequestAccountsFromSigner = funtypes.Static<typeof RequestAccountsFromSigner>
export const RequestAccountsFromSigner = funtypes.Object({
	method: funtypes.Literal('popup_requestAccountsFromSigner'),
	options: funtypes.Boolean
}).asReadonly()

export type EnableSimulationMode = funtypes.Static<typeof EnableSimulationMode>
export const EnableSimulationMode = funtypes.Object({
	method: funtypes.Literal('popup_enableSimulationMode'),
	options: funtypes.Boolean
}).asReadonly()

export type RemoveTransaction = funtypes.Static<typeof RemoveTransaction>
export const RemoveTransaction = funtypes.Object({
	method: funtypes.Literal('popup_removeTransaction'),
	options: EthereumQuantity,
}).asReadonly()

export type ResetSimulation = funtypes.Static<typeof ResetSimulation>
export const ResetSimulation = funtypes.Object({
	method: funtypes.Literal('popup_resetSimulation')
}).asReadonly()

export type RefreshSimulation = funtypes.Static<typeof RefreshSimulation>
export const RefreshSimulation = funtypes.Object({
	method: funtypes.Literal('popup_refreshSimulation')
}).asReadonly()

export type RefreshConfirmTransactionDialogSimulation = funtypes.Static<typeof RefreshConfirmTransactionDialogSimulation>
export const RefreshConfirmTransactionDialogSimulation = funtypes.Object({
	method: funtypes.Literal('popup_refreshConfirmTransactionDialogSimulation')
}).asReadonly()

export type ChangeInterceptorAccess = funtypes.Static<typeof ChangeInterceptorAccess>
export const ChangeInterceptorAccess = funtypes.Object({
	method: funtypes.Literal('popup_changeInterceptorAccess'),
	options: funtypes.ReadonlyArray(
		funtypes.Object({
			origin: funtypes.String,
			originIcon: funtypes.Union(funtypes.String, funtypes.Undefined),
			access: funtypes.Boolean,
			addressAccess: funtypes.Union(
				funtypes.ReadonlyArray(funtypes.Object( {
					address: funtypes.String,
					access: funtypes.Boolean,
				} ))
			, funtypes.Undefined),
		})
	)
}).asReadonly()

export type ChangeActiveChain = funtypes.Static<typeof ChangeActiveChain>
export const ChangeActiveChain = funtypes.Object({
	method: funtypes.Literal('popup_changeActiveChain'),
	options: EthereumQuantity,
}).asReadonly()

export type ChainChangeConfirmation = funtypes.Static<typeof ChainChangeConfirmation>
export const ChainChangeConfirmation = funtypes.Object({
	method: funtypes.Literal('popup_changeChainDialog'),
	options: funtypes.Object({
		accept: funtypes.Boolean
	})
}).asReadonly()

export type SignerName = funtypes.Static<typeof SignerName>
export const SignerName = funtypes.Union(
	funtypes.Literal('NoSigner'),
	funtypes.Literal('NotRecognizedSigner'),
	funtypes.Literal('MetaMask'),
	funtypes.Literal('Brave'),
)

export type ConnectedToSigner = funtypes.Static<typeof ConnectedToSigner>
export const ConnectedToSigner = funtypes.Object({
	method: funtypes.Literal('connected_to_signer'),
	params: funtypes.Tuple(SignerName),
}).asReadonly()

export type WalletSwitchEthereumChainReply = funtypes.Static<typeof WalletSwitchEthereumChainReply>
export const WalletSwitchEthereumChainReply = funtypes.Object({
	method: funtypes.Literal('wallet_switchEthereumChain_reply'),
	params: funtypes.Tuple(funtypes.Object({
		accept: funtypes.Boolean,
		chainId: EthereumQuantity,
	}))
}).asReadonly()

export type ReviewNotification = funtypes.Static<typeof ReviewNotification>
export const ReviewNotification = funtypes.Object({
	method: funtypes.Literal('popup_reviewNotification'),
	options: funtypes.Object({
		origin: funtypes.String,
		requestAccessToAddress: funtypes.Union(funtypes.String, funtypes.Undefined),
	})
}).asReadonly()

export type RejectNotification = funtypes.Static<typeof RejectNotification>
export const RejectNotification = funtypes.Object({
	method: funtypes.Literal('popup_rejectNotification'),
	options: funtypes.Object({
		origin: funtypes.String,
		requestAccessToAddress: funtypes.Union(funtypes.String, funtypes.Undefined),
		removeOnly: funtypes.Boolean,
	})
}).asReadonly()

export type PopupMessage = funtypes.Static<typeof PopupMessage>
export const PopupMessage = funtypes.Union(
	ChangeAddressInfos,
	ChangeMakeMeRich,
	ChangeActiveAddress,
	TransactionConfirmation,
	ChangePage,
	RequestAccountsFromSigner,
	RemoveTransaction,
	ResetSimulation,
	RefreshSimulation,
	RefreshConfirmTransactionDialogSimulation,
	PersonalSign,
	InterceptorAccess,
	ChangeInterceptorAccess,
	ChangeActiveChain,
	ChainChangeConfirmation,
	EnableSimulationMode,
	RejectNotification,
	ReviewNotification,
	ConnectedToSigner,
)
