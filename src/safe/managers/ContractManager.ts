import { getSafeContract } from '../getSafeContract.js'
import { ContractNetworksConfig, SafeConfig, SafeContract, SafeVersion } from '../types.js'
import { isSafeConfigWithPredictedSafe } from '../utils.js'

const DEFAULT_SAFE_VERSION: SafeVersion = '1.3.0'

export class ContractManager {
  #contractNetworks?: ContractNetworksConfig
  #isL1SafeMasterCopy?: boolean
  #safeContract?: SafeContract

  static async create(config: SafeConfig): Promise<ContractManager> {
    const contractManager = new ContractManager()
    await contractManager.init(config)
    return contractManager
  }

  async init(config: SafeConfig): Promise<void> {
    const {
      publicClient,
      isL1SafeMasterCopy,
      contractNetworks,
      predictedSafe,
      safeAddress,
      walletClient,
      chain,
      account,
    } = config

    this.#contractNetworks = contractNetworks
    this.#isL1SafeMasterCopy = isL1SafeMasterCopy

    let safeVersion: SafeVersion

    if (isSafeConfigWithPredictedSafe(config)) {
      safeVersion = predictedSafe?.safeDeploymentConfig?.safeVersion ?? DEFAULT_SAFE_VERSION
    } else {
      // We use the default version of the Safe contract to get the correct version of this Safe
      const defaultSafeContractInstance = await getSafeContract({
        publicClient,
        walletClient,
        safeVersion: DEFAULT_SAFE_VERSION,
        isL1SafeMasterCopy,
        customSafeAddress: safeAddress,
        chain,
        account,
      })

      // We check the correct version of the Safe from the blockchain
      safeVersion = await defaultSafeContractInstance.getVersion()

      // We get the correct Safe Contract if the real Safe version is not the lastest
      const isTheDefaultSafeVersion = safeVersion === DEFAULT_SAFE_VERSION

      this.#safeContract = isTheDefaultSafeVersion
        ? defaultSafeContractInstance
        : await getSafeContract({
            publicClient,
            walletClient,
            safeVersion,
            isL1SafeMasterCopy,
            chain,
            customSafeAddress: safeAddress,
            account,
          })
    }
  }

  get contractNetworks(): ContractNetworksConfig | undefined {
    return this.#contractNetworks
  }

  get isL1SafeMasterCopy(): boolean | undefined {
    return this.#isL1SafeMasterCopy
  }

  get safeContract(): SafeContract | undefined {
    return this.#safeContract
  }
}
