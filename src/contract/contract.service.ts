import { Injectable, NotFoundException } from '@nestjs/common';
import * as StellarSdk from '@stellar/stellar-sdk';
import { SorobanRpc, TransactionBuilder } from '@stellar/stellar-sdk';
import {
  LinkResponse,
  StellarEntity,
  StellarLinkRequest,
  StellarInput,
} from './contract.types';
import { ContractRepository } from './contract.repository';

const STELLAR_NETWORK_ADDRESSES = {
  TESTNET: 'https://soroban-testnet.stellar.org',
  MAINNET: 'https://soroban.stellar.org',
};

const STELLAR_NETWORK_PASSPHRASES = {
  TESTNET: StellarSdk.Networks.TESTNET,
  MAINNET: StellarSdk.Networks.PUBLIC,
};

@Injectable()
export class ContractService {
  constructor(private repository: ContractRepository) {}

  async processDebug(id: string, action: string, request: StellarLinkRequest): Promise<LinkResponse> {
    console.log(request);
    const processedAction = await this.processAction(id, action, request);
    console.log("Processed Action");
    const keys = StellarSdk.Keypair.fromSecret("SDKQ6ALGJP6YRZPPEWNLIZ6TWV7JXNRIPIJLTQWA4GPH237KOYE4MUNU");    
    const rpc = new SorobanRpc.Server(STELLAR_NETWORK_ADDRESSES[processedAction.network]);
    const tx = TransactionBuilder.fromXDR(processedAction.transaction, StellarSdk.Networks.TESTNET)
    const preparedTx = await rpc.prepareTransaction(tx);
    preparedTx.sign(keys);
    const result = await rpc.sendTransaction(preparedTx);
  
    console.log("Result: ");
    console.log(result);
    console.log(result.errorResult);
    console.log("Done");
    
    return processedAction}

  async getAction(id: string): Promise<StellarEntity> {
    return this.repository.get(id);
  }

  async processAction(id: string, action: string, request: StellarLinkRequest) {
    const stellarEntity = await this.repository.get(id);
    if (!stellarEntity) {
      throw new NotFoundException('Stellar Entity not found');
    }
    const stellarAction = stellarEntity.actions.find((a) => a.id === action);
    if (!stellarAction) {
      throw new NotFoundException('Stellar Action not found');
    }

    const contract = new StellarSdk.Contract(stellarEntity.contract);
    const rpc = new SorobanRpc.Server(STELLAR_NETWORK_ADDRESSES[stellarEntity.network]);

    const account = await rpc.getAccount(request.publicKey);
    const params = stellarAction.input?.map((param) => this.prepareParams(param, request.publicKey)) || [];

    const options = {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASES[stellarEntity.network],
    }
    const transaction = new TransactionBuilder(account, options)
      .addOperation(contract.call(stellarAction.method, ...params))
      .setTimeout(30)
      .build();

    return {
      network: stellarEntity.network,
      transaction: transaction.toXDR(),
    };
  }

  private prepareParams(
    param: StellarInput,
    publicKey: string,
  ): StellarSdk.xdr.ScVal {
    switch (param.type) {
      case 'distribution': {
        return StellarSdk.xdr.ScVal.scvVec(param.value.map(this.prepareDiscribution));
      }
      case 'caller': {
        return StellarSdk.nativeToScVal(publicKey, { type: 'address' });
      }
      default: {
        return StellarSdk.nativeToScVal(param.value, { type: param.type });
      }
    }
  }

  private prepareDiscribution(input: { parts: number; path: string[]; protocol_id: string }): StellarSdk.xdr.ScVal {
    return StellarSdk.xdr.ScVal.scvMap([
        new StellarSdk.xdr.ScMapEntry({
          key: StellarSdk.xdr.ScVal.scvSymbol('parts'),
          val: StellarSdk.nativeToScVal(input.parts, { type: 'u32' }),
        }),
        new StellarSdk.xdr.ScMapEntry({
          key: StellarSdk.xdr.ScVal.scvSymbol('path'),
          val: StellarSdk.xdr.ScVal.scvVec(input.path.map(path => StellarSdk.nativeToScVal(path, { type: 'address' }))),
        }),
        new StellarSdk.xdr.ScMapEntry({
          key: StellarSdk.xdr.ScVal.scvSymbol('protocol_id'),
          val: StellarSdk.nativeToScVal(input.protocol_id),
        }),
      ]);
  }
}
