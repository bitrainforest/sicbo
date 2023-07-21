import { Inject, Controller, Get, Query, ALL } from '@midwayjs/core';

import { BaseController } from '../../core/baseController';
import { SicBoService } from '../service/sicbo';
import { Betting } from '../model/dto/game/game';

@Controller('/contract', { tagName: 'contract', description: '用户管理控制器' })
export class ContractController extends BaseController {
  @Inject()
  protected service: SicBoService;

  @Get('/decrypt', {
    summary: '测试解密',
    description: '测试解密',
  })
  async decrypt(
    @Query(ALL)
    param: {
      cix: string;
      viewKey: string;
    }
  ) {
    const { cix } = param;
    const res = await this.service.decryptRecord(cix);
    return this.success(res);
  }

  @Get('/check/onchain', {
    summary: 'check transactionId on chain',
    description: 'check transactionId on chain',
  })
  async checkExcute(
    @Query('transaction')
    transaction: string
  ) {
    const res = await this.service.checkOnChain(transaction);
    return this.success(res);
  }

  @Get('/transaction/record', {
    summary: 'decrypt record',
    description: 'decrypt record',
  })
  async getTransactionRecord(
    @Query(ALL)
    param: Betting
  ) {
    const res = await this.service.getBettingRecord(param);
    return this.success(res);
  }
}
