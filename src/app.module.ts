import { Module } from '@nestjs/common';
import { ContractService } from './contract/contract.service';
import { ContractController } from './contract/contract.controller';
import { HttpModule } from '@nestjs/axios';
import { ContractRepository } from './contract/contract.repository';

@Module({
  imports: [HttpModule],
  controllers: [ContractController],
  providers: [ContractService, ContractRepository],
})
export class AppModule {}
