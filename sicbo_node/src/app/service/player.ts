import { Inject, Provide } from '@midwayjs/core';

import { PlayerMapping } from '../mapping/player';
import { BaseService } from '../../core/baseService';
import { PlayerEntity } from '../entity/player';
import { SicBoService } from './sicbo';
import { PlayerRecordMapping } from '../mapping/playerRecord';
import MyError from '../comm/myError';

@Provide()
export class PlayerService extends BaseService<PlayerEntity> {
  @Inject()
  mapping: PlayerMapping;

  @Inject()
  sicBoService: SicBoService;

  @Inject()
  playerRecordMapping: PlayerRecordMapping;

  /**
   * @description get userInfo
   * @param wallet
   * @returns
   */
  async getPlayerInfo(wallet: string) {
    let player = await this.mapping.findOne({ wallet });
    if (!player) {
      player = await this.registerPlayer(wallet);
    }
    return player;
  }

  /**
   * @description register user
   * @param wallet
   * @returns
   */
  async registerPlayer(wallet: string) {
    try {
      await this.sicBoService.sendChips(wallet);
    } catch (e) {
      console.log(e);
      throw new MyError('Abnormal distribution of chips');
    }
    const player = await this.mapping.saveNew({ wallet, balance: 1000 });
    return player;
  }

  /**
   * @default add player balance
   * @param param
   * @param wallet
   * @returns
   */
  async addBalance(param, wallet) {
    const res = await this.mapping.increment(param, {
      wallet,
    });
    return res;
  }

  /**
   * @description 获取最后一次筹码
   * @param wallet
   * @returns
   */
  async getChipsRecord(wallet: string) {
    const record = await this.playerRecordMapping.getLastRecord(wallet);
    return record;
  }
}
