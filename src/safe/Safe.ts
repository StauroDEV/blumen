import { PublicClient } from 'viem'
import { PredictedSafeProps, SafeConfig } from './types.js'
import { ContractManager } from './managers/ContractManager.js'
import { isSafeConfigWithPredictedSafe } from './utils.js'

export class Safe {
  publicClient!: PublicClient
  #predictedSafe!: PredictedSafeProps
  #contractManager!: ContractManager

  static async create(config: SafeConfig): Promise<Safe> {
    const safeSdk = new Safe()
    await safeSdk.init(config)
    return safeSdk
  }

  private async init(config: SafeConfig): Promise<void> {
    const { publicClient, walletClient, isL1SafeMasterCopy, contractNetworks, account, chain } = config

    this.publicClient = publicClient

    if (isSafeConfigWithPredictedSafe(config)) {
      this.#predictedSafe = config.predictedSafe
      this.#contractManager = await ContractManager.create({
        publicClient: this.publicClient,
        predictedSafe: this.#predictedSafe,
        isL1SafeMasterCopy,
        contractNetworks,
        account,
        chain,
        walletClient,
      })
    } else {
      this.#contractManager = await ContractManager.create({
        publicClient: this.publicClient,
        safeAddress: config.safeAddress,
        isL1SafeMasterCopy,
        contractNetworks,
        account,
        chain,
        walletClient,
      })
    }
  }
  getContractManager(): ContractManager {
    return this.#contractManager
  }
  async getThreshold(): Promise<bigint> {
    if (this.#predictedSafe?.safeAccountConfig.threshold) {
      return Promise.resolve(this.#predictedSafe.safeAccountConfig.threshold)
    }

    return this.#ownerManager.getThreshold()
  }
}
