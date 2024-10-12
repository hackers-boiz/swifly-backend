import { Injectable, NotFoundException } from '@nestjs/common';
import * as StellarSdk from "@stellar/stellar-sdk";
import { SorobanRpc, TransactionBuilder } from '@stellar/stellar-sdk';
import { LinkResponse, StellarEntity, StellarLinkRequest, StellarInput } from './contract.types';
import { ContractRepository } from './contract.repository';

const STELLAR_NETWORK_ADDRESSES = {
    'TESTNET': "https://soroban-testnet.stellar.org",
    'MAINNET': "https://soroban.stellar.org",
}

const STELLAR_NETWORK_PASSPHRASES = {
    'TESTNET': StellarSdk.Networks.TESTNET,
    'MAINNET': StellarSdk.Networks.PUBLIC,
}

@Injectable()
export class ContractService {
constructor(private repository: ContractRepository) {}

    async getAction(id: string): Promise<StellarEntity> {
        return this.repository.get(id);
    }

    async processAction(id: string, action: string, request: StellarLinkRequest) {
        const stellarEntity = await this.repository.get(id);
        if(!stellarEntity) {
            throw new NotFoundException("Stellar Entity not found");
         }
        const stellarAction  = stellarEntity.actions.find(a => a.id === action);
        if(!stellarAction) {
            throw new NotFoundException("Stellar Action not found");
        }

        const contract = new StellarSdk.Contract(stellarEntity.contract);
        const rpc = new SorobanRpc.Server(STELLAR_NETWORK_ADDRESSES[stellarEntity.network]);

        const account = await rpc.getAccount(request.publicKey);
        const params = stellarAction.input?.map((param) => this.prepareParams(param, request.publicKey)) || [];
        
        const transaction = new TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: STELLAR_NETWORK_PASSPHRASES[stellarEntity.network],
          })
          .addOperation(contract.call(stellarAction.method, ...params))
          .setTimeout(30)
          .build();

        return {
            network: stellarEntity.network,
            transaction: transaction.toXDR()
        }
    }

    private prepareParams(param: StellarInput, publicKey: string) {
        switch(param.type) {
            case 'caller': {
                return StellarSdk.nativeToScVal(publicKey, {type: 'address'});
            }
            default: {
                return StellarSdk.nativeToScVal(param.value, {type: param.type});
            }
        }
    }
  }
