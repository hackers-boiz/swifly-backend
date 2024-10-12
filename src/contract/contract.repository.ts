import { Injectable, NotFoundException } from '@nestjs/common';
import * as StellarSdk from "@stellar/stellar-sdk";
import { SorobanRpc, TransactionBuilder } from '@stellar/stellar-sdk';
import { LinkResponse, StellarEntity, StellarLinkRequest, StellarBaseInput } from './contract.types';
import { HttpService } from '@nestjs/axios';
import { Observable, firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

const STELLAR_NETWORK_ADDRESSES = {
    'TESTNET': "https://soroban-testnet.stellar.org",
    'MAINNET': "https://soroban.stellar.org",
}

const STELLAR_NETWORK_PASSPHRASES = {
    'TESTNET': StellarSdk.Networks.TESTNET,
    'MAINNET': StellarSdk.Networks.PUBLIC,
}

const PREFIX = "https://raw.githubusercontent.com/hackers-boiz/swifly-verification/refs/heads/main/swifly/"
const POSTFIX = "/metadata.json"

@Injectable()
export class ContractRepository {
    constructor(private http: HttpService) {}

    async get(id: string): Promise<StellarEntity> {
        try {
            const repsonse = await firstValueFrom(this.http.get(PREFIX + id + POSTFIX));
            return repsonse.data;
        } catch (error) {
            throw new NotFoundException("Swifly not found");
        }
    }
}

