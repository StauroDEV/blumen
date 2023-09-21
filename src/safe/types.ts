import { SingletonDeployment } from '@safe-global/safe-deployments'
import { Hex, PrivateKeyAccount, SendTransactionParameters } from 'viem'
import { Hash } from 'viem'
import { Address } from 'viem'
import { AbiItem, TransactionRequest } from 'viem'
import { SafeAbiFunctionName } from './abi.js'
import { PublicClient } from 'viem'
import { WalletClient } from 'viem'
import { Chain } from 'viem'

export type SafeVersion = '1.4.1' | '1.3.0'

export enum OperationType {
  Call, // 0
  DelegateCall, // 1
}

export interface SafeSetupConfig {
  owners: Address[]
  threshold: bigint
  to?: Address
  data?: Hex
  fallbackHandler?: Address
  paymentToken?: Address
  payment?: bigint
  paymentReceiver?: Address
}
export interface MetaTransactionData {
  to: Address
  value: bigint
  data: Hex
  operation?: OperationType
}

export interface SafeTransactionData extends MetaTransactionData {
  operation: OperationType
  safeTxGas: bigint
  baseGas: bigint
  gasPrice: bigint
  gasToken: Address
  refundReceiver: Address
  nonce: bigint
}

export type SafeTransactionDataPartial = Partial<SafeTransactionData>

export interface SafeSignature {
  readonly signer: Address
  readonly data: Hex
  staticPart(): string
  dynamicPart(): string
}

export interface SafeTransaction {
  readonly data: SafeTransactionData
  readonly signatures: Map<string, SafeSignature>
  addSignature(signature: SafeSignature): void
  encodedSignatures(): Hex
}

export interface Eip3770Address {
  prefix: string
  address: string
}

export interface SafeTransactionEIP712Args {
  safeAddress: Address
  safeVersion: SafeVersion
  chainId: number
  safeTransactionData: SafeTransactionData
}

export interface Eip712MessageTypes {
  EIP712Domain: {
    type: string
    name: string
  }[]
  SafeTx: {
    type: string
    name: string
  }[]
}

export interface GenerateTypedData {
  types: Eip712MessageTypes
  domain: {
    chainId?: number
    verifyingContract: string
  }
  primaryType: string
  message: {
    to: string
    value: string
    data: string
    operation: OperationType
    safeTxGas: string
    baseGas: string
    gasPrice: string
    gasToken: string
    refundReceiver: string
    nonce: number
  }
}

export type SafeMultisigConfirmationResponse = {
  readonly owner: string
  readonly submissionDate: string
  readonly transactionHash?: string
  readonly confirmationType?: string
  readonly signature: string
  readonly signatureType?: string
}

export type SafeMultisigConfirmationListResponse = {
  readonly count: number
  readonly next?: string
  readonly previous?: string
  readonly results: SafeMultisigConfirmationResponse[]
}

export type SafeMultisigTransactionResponse = {
  readonly safe: string
  readonly to: string
  readonly value: string
  readonly data?: string
  readonly operation: number
  readonly gasToken: string
  readonly safeTxGas: number
  readonly baseGas: number
  readonly gasPrice: string
  readonly refundReceiver?: string
  readonly nonce: number
  readonly executionDate: string
  readonly submissionDate: string
  readonly modified: string
  readonly blockNumber?: number
  readonly transactionHash: string
  readonly safeTxHash: string
  readonly executor?: string
  readonly isExecuted: boolean
  readonly isSuccessful?: boolean
  readonly ethGasPrice?: string
  readonly gasUsed?: number
  readonly fee?: string
  readonly origin: string
  readonly dataDecoded?: string
  readonly confirmationsRequired: number
  readonly confirmations?: SafeMultisigConfirmationResponse[]
  readonly trusted: boolean
  readonly signatures?: string
}

export interface RelayTransaction {
  target: string
  encodedTransaction: string
  chainId: number
  options?: MetaTransactionOptions
}

export interface MetaTransactionOptions {
  gasLimit?: string
  gasToken?: Address
  isSponsored?: boolean
}

export interface Eip3770Address {
  prefix: string
  address: string
}

export interface ContractNetworkConfig {
  /** safeMasterCopyAddress - Address of the Safe Master Copy contract deployed on a specific network */
  safeMasterCopyAddress: Address
  /** safeMasterCopyAbi - Abi of the Safe Master Copy contract deployed on a specific network */
  safeMasterCopyAbi?: AbiItem[]
  /** safeProxyFactoryAddress - Address of the SafeProxyFactory contract deployed on a specific network */
  safeProxyFactoryAddress: Address
  /** safeProxyFactoryAbi - Abi of the SafeProxyFactory contract deployed on a specific network */
  safeProxyFactoryAbi?: AbiItem[]
  /** multiSendAddress - Address of the MultiSend contract deployed on a specific network */
  multiSendAddress: Address
  /** multiSendAbi - Abi of the MultiSend contract deployed on a specific network */
  multiSendAbi?: AbiItem[]
  /** multiSendCallOnlyAddress - Address of the MultiSendCallOnly contract deployed on a specific network */
  multiSendCallOnlyAddress: Address
  /** multiSendCallOnlyAbi - Abi of the MultiSendCallOnly contract deployed on a specific network */
  multiSendCallOnlyAbi?: AbiItem[]
  /** fallbackHandlerAddress - Address of the Fallback Handler contract deployed on a specific network */
  fallbackHandlerAddress: Address
  /** fallbackHandlerAbi - Abi of the Fallback Handler contract deployed on a specific network */
  fallbackHandlerAbi?: AbiItem[]
  /** signMessageLibAddress - Address of the SignMessageLib contract deployed on a specific network */
  signMessageLibAddress: Address
  /** signMessageLibAbi - Abi of the SignMessageLib contract deployed on a specific network */
  signMessageLibAbi?: AbiItem[]
  /** createCallAddress - Address of the CreateCall contract deployed on a specific network */
  createCallAddress: Address
  /** createCallAbi - Abi of the CreateCall contract deployed on a specific network */
  createCallAbi?: AbiItem[]
  /** simulateTxAccessorAddress - Address of the SimulateTxAccessor contract deployed on a specific network */
  simulateTxAccessorAddress: Address
  /** simulateTxAccessorAbi - Abi of the SimulateTxAccessor contract deployed on a specific network */
  simulateTxAccessorAbi?: AbiItem[]
}

export interface ContractNetworksConfig {
  /** id - Network id */
  [id: string]: ContractNetworkConfig
}

export interface SafeContract {
  getVersion(): Promise<SafeVersion>
  getAddress(): Address
  getNonce(): Promise<bigint>
  getThreshold(): Promise<bigint>
  getOwners(): Promise<string[]>
  isOwner(address: Address): Promise<boolean>
  getTransactionHash(safeTransactionData: SafeTransactionData): Promise<string>
  approvedHashes(ownerAddress: Address, hash: Hash): Promise<bigint>
  approveHash(hash: Hash, options?: SendTransactionParameters): Promise<Hash>
  isModuleEnabled(moduleAddress: Address): Promise<boolean>
  execTransaction(safeTransaction: SafeTransaction, options?: SendTransactionParameters): Promise<Hash>
  encode(methodName: SafeAbiFunctionName, params: any): Hex
}

export interface SafeDeploymentConfig {
  saltNonce?: string
  safeVersion?: SafeVersion
}

export interface PredictedSafeProps {
  safeAccountConfig: SafeSetupConfig
  safeDeploymentConfig?: SafeDeploymentConfig
}

type SafeConfigWithSafeAddressProps = {
  /** safeAddress - The address of the Safe account to use */
  safeAddress: Address
  /** predictedSafe - The configuration of the Safe that is not yet deployed */
  predictedSafe?: never
}

type SafeConfigWithPredictedSafeProps = {
  /** safeAddress - The address of the Safe account to use */
  safeAddress?: Address
  /** predictedSafe - The configuration of the Safe that is not yet deployed */
  predictedSafe: PredictedSafeProps
}

export type SafeConfigProps = {
  /** publicClient - Ethereum adapter */
  publicClient: PublicClient
  walletClient: WalletClient
  chain: Chain
  account: PrivateKeyAccount
  /** isL1SafeMasterCopy - Forces to use the Safe L1 version of the contract instead of the L2 version */
  isL1SafeMasterCopy?: boolean
  /** contractNetworks - Contract network configuration */
  contractNetworks?: ContractNetworksConfig
}

export type SafeConfigWithSafeAddress = SafeConfigProps & SafeConfigWithSafeAddressProps
export type SafeConfigWithPredictedSafe = SafeConfigProps & SafeConfigWithPredictedSafeProps
export type SafeConfig = SafeConfigWithSafeAddress | SafeConfigWithPredictedSafe
