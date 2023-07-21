import { Inject, Controller, Get, Query } from '@midwayjs/core';

import { PlayerService } from '../service/player';
import { BaseController } from '../../core/baseController';

@Controller('/player', { tagName: 'Player', description: '用户管理控制器' })
export class PlayerController extends BaseController {
  @Inject()
  protected service: PlayerService;

  @Inject()
  protected sicBoService: PlayerService;

  @Get('/info', {
    summary: 'get userInfo',
    description: 'get userInfo',
  })
  async getPlayerInfo(
    @Query('wallet')
    wallet: string
  ) {
    const res = await this.service.getPlayerInfo(wallet);
    return this.success(res);
  }

  @Get('/chips/record', {
    summary: 'get chips record',
    description: 'get chips record',
  })
  async getChipsRecord(
    @Query('wallet')
    wallet: string
  ) {
    const res = await this.service.getChipsRecord(wallet);
    return this.success(res);
  }
}
