import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ContractService } from './contract.service';
import {
  GetActionResponse,
  StellarAction,
  StellarLinkRequest,
} from './contract.types';

@Controller()
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Post('debug/:id/:action')
  async processDebug(
    @Param('id') id: string,
    @Param('action') action: string,
    @Body() request: StellarLinkRequest,
  ) {
    const response = await this.service.processDebug(id, action, request);
    return response;
  }

  @Get(':id')
  async getAction(@Param('id') id: string): Promise<GetActionResponse> {
    const action = await this.service.getAction(id);
    return {
      name: action.name,
      description: action.description,
      image: action.image,
      website: action.website,
      actions: action.actions.map(this.mapAction),
    };
  }

  @Post(':id/:action')
  async processAction(
    @Param('id') id: string,
    @Param('action') action: string,
    @Body() request: StellarLinkRequest,
  ) {
    return await this.service.processAction(id, action, request);
  }

  private mapAction(actions: StellarAction) {
    return {
      id: actions.id,
      label: actions.label,
    };
  }
}
