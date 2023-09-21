import {
  type PublicClient,
  type Address,
  getContract,
  GetContractReturnType,
  encodeFunctionData,
  PrivateKeyAccount,
  zeroAddress,
} from 'viem'
import { isContractDeployed } from './isContractDeployed.js'
import {
  DeploymentFilter,
  SingletonDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
} from '@safe-global/safe-deployments'
import { SafeContract, SafeSetupConfig, SafeTransaction, SafeTransactionData, SafeVersion } from './types.js'
import { SafeAbiFunctionName, SafeAbiType, SafeAbiWriteFunctionNames } from './abi.js'
import { Hash } from 'viem'
import { SendTransactionParameters } from 'viem/wallet'
import { Hex } from 'viem'
import { GetFunctionArgs } from 'viem'
import { WalletClient } from 'viem'
import { Chain } from 'viem'

interface GetContractInstanceProps {
  publicClient: PublicClient
  walletClient: WalletClient
  chain: Chain
  safeVersion: SafeVersion
  account: PrivateKeyAccount
}

interface GetSafeContractInstanceProps extends GetContractInstanceProps {
  isL1SafeMasterCopy?: boolean
  customSafeAddress?: Address
}

type SafeDeploymentsVersions = {
  [version: string]: {
    safeMasterCopyVersion: string
    safeMasterCopyL2Version?: string
    safeProxyFactoryVersion: string
    compatibilityFallbackHandler: string
    multiSendVersion: string
    multiSendCallOnlyVersion?: string
    signMessageLibVersion?: string
    createCallVersion?: string
  }
}

const safeDeploymentsVersions: SafeDeploymentsVersions = {
  '1.4.1': {
    safeMasterCopyVersion: '1.4.1',
    safeMasterCopyL2Version: '1.4.1',
    safeProxyFactoryVersion: '1.4.1',
    compatibilityFallbackHandler: '1.4.1',
    multiSendVersion: '1.4.1',
    multiSendCallOnlyVersion: '1.4.1',
    signMessageLibVersion: '1.4.1',
    createCallVersion: '1.4.1',
  },
  '1.3.0': {
    safeMasterCopyVersion: '1.3.0',
    safeMasterCopyL2Version: '1.3.0',
    safeProxyFactoryVersion: '1.3.0',
    compatibilityFallbackHandler: '1.3.0',
    multiSendVersion: '1.3.0',
    multiSendCallOnlyVersion: '1.3.0',
    signMessageLibVersion: '1.3.0',
    createCallVersion: '1.3.0',
  },
}

const safeDeploymentsL1ChainIds = [
  1, // Ethereum Mainnet
]

function getSafeContractDeployment({
  chainId,
  isL1SafeMasterCopy = false,
  safeVersion,
}: {
  chainId: number
  isL1SafeMasterCopy?: boolean
  safeVersion: SafeVersion
}): SingletonDeployment | undefined {
  const version = safeDeploymentsVersions[safeVersion].safeMasterCopyVersion
  const filters: DeploymentFilter = {
    version,
    network: chainId.toString(),
    released: true,
  }
  if (safeDeploymentsL1ChainIds.includes(chainId) || isL1SafeMasterCopy) {
    return getSafeSingletonDeployment(filters)
  }
  return getSafeL2SingletonDeployment(filters)
}

class SafeContractInstance implements SafeContract {
  #contract: GetContractReturnType<SafeAbiType, PublicClient, WalletClient>
  #options: { chain: Chain; account: PrivateKeyAccount }
  constructor({
    contract,
    account,
    chain,
  }: {
    contract: GetContractReturnType<SafeAbiType, PublicClient, WalletClient>
    account: PrivateKeyAccount
    chain: Chain
  }) {
    this.#contract = contract
    this.#options = { account, chain }
  }

  getVersion() {
    return this.#contract.read.VERSION() as Promise<SafeVersion>
  }
  getAddress() {
    return this.#contract.address
  }
  getNonce() {
    return this.#contract.read.nonce()
  }
  getThreshold() {
    return this.#contract.read.getThreshold()
  }
  getOwners(): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  isOwner(address: Address) {
    return this.#contract.read.isOwner([address])
  }
  getTransactionHash(safeTransactionData: SafeTransactionData) {
    return this.#contract.read.getTransactionHash([
      safeTransactionData.to,
      safeTransactionData.value,
      safeTransactionData.data,
      safeTransactionData.operation,
      safeTransactionData.safeTxGas,
      safeTransactionData.baseGas,
      safeTransactionData.gasPrice,
      safeTransactionData.gasToken,
      safeTransactionData.refundReceiver,
      safeTransactionData.nonce,
    ])
  }
  approvedHashes(ownerAddress: Address, hash: Hash) {
    return this.#contract.read.approvedHashes([ownerAddress, hash])
  }
  approveHash(hash: Hash, options?: SendTransactionParameters | undefined) {
    return this.#contract.write.approveHash([hash], {
      ...this.#options,
      ...options,
      value: undefined,
    })
  }

  isModuleEnabled(moduleAddress: Address): Promise<boolean> {
    return this.#contract.read.isModuleEnabled([moduleAddress])
  }
  async execTransaction(safeTransaction: SafeTransaction, options?: SendTransactionParameters) {
    return await this.#contract.write.execTransaction(
      [
        safeTransaction.data.to,
        safeTransaction.data.value,
        safeTransaction.data.data,
        safeTransaction.data.operation,
        safeTransaction.data.safeTxGas,
        safeTransaction.data.baseGas,
        safeTransaction.data.gasPrice,
        safeTransaction.data.gasToken,
        safeTransaction.data.refundReceiver,
        safeTransaction.encodedSignatures(),
      ],
      { ...this.#options, ...options },
    )
  }
  encode(methodName: SafeAbiFunctionName, args: GetFunctionArgs<SafeAbiType, typeof methodName>['args']): Hex {
    return encodeFunctionData({ abi: this.#contract.abi, functionName: methodName, args })
  }
}

export async function getSafeContract({
  walletClient,
  publicClient,
  customSafeAddress,
  isL1SafeMasterCopy,
  safeVersion,
  account,
  chain,
}: GetSafeContractInstanceProps): Promise<SafeContract> {
  const singletonDeployment = getSafeContractDeployment({
    chainId: chain.id,
    isL1SafeMasterCopy,
    safeVersion,
  })

  if (!singletonDeployment) {
    throw new Error('Invalid contract deployment')
  }

  const contractAddress = customSafeAddress ?? (singletonDeployment?.networkAddresses[chain.id] as Address)
  if (!contractAddress) {
    throw new Error('Invalid SafeProxy contract address')
  }

  const safeContract = getContract({
    abi: singletonDeployment.abi as unknown as SafeAbiType,
    address: contractAddress,
    publicClient,
    walletClient,
  })

  if (!(await isContractDeployed({ address: safeContract.address, provider: publicClient }))) {
    throw new Error('SafeProxy contract is not deployed on the current network')
  }

  return new SafeContractInstance({ contract: safeContract, account, chain })
}
