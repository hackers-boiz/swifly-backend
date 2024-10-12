import { Injectable, NotFoundException } from '@nestjs/common';
import { StellarEntity } from './contract.types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const BASE_URL = 'https://raw.githubusercontent.com';
const PREFIX = '/hackers-boiz/swifly-verification/refs/heads/main/swifly/';
const POSTFIX = '/metadata.json';

@Injectable()
export class ContractRepository {
  constructor(private http: HttpService) {}

  async get(id: string): Promise<StellarEntity> {
    try {
      const request = this.http.get(BASE_URL + PREFIX + id + POSTFIX);
      const repsonse = await firstValueFrom(request);
      return repsonse.data;
    } catch (error) {
      throw new NotFoundException('Swifly not found');
    }
  }
}
