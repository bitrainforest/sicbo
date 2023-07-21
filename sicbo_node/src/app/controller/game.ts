import {
  Inject,
  Controller,
  Post,
  ALL,
  Body,
  Get,
  Query,
} from '@midwayjs/core';

import { BaseController } from '../../core/baseController';
import { Betting, QueryRecordDTO, lotteryDTO } from '../model/dto/game/game';
import { GameService } from '../service/game';

@Controller('/game', { tagName: 'game', description: '游戏管理控制器' })
export class GameController extends BaseController {
  @Inject()
  gameService: GameService;

  @Post('/bet', {
    summary: 'player bet lock',
    description: 'player bet lock',
  })
  async bet(
    @Body(ALL)
    param: lotteryDTO
  ) {
    const res = await this.gameService.wantBet(param);
    return this.success(res);
  }

  @Post('/settlement', {
    summary: 'game settle',
    description: 'game settle',
  })
  async settlement(
    @Body(ALL)
    param: Betting
  ) {
    const res = await this.gameService.lottery(param);
    return this.success(res);
  }

  @Get('/record', {
    summary: 'get game records',
    description: 'get game records',
  })
  async getRecord(
    @Query(ALL)
    param: QueryRecordDTO
  ) {
    const res = await this.gameService.getRecordList(param);
    return this.success(res);
  }

  @Get('/status', {
    summary: 'game status',
    description: 'game status',
  })
  async status() {
    const res = await this.gameService.getGameStatus();
    return this.success(res);
  }

  @Post('/correcting/status', {
    summary: 'correcting game status',
    description: 'correcting game status',
  })
  async correctStatus() {
    const res = await this.gameService.unlockGameStatus();
    return this.success(res);
  }
}
