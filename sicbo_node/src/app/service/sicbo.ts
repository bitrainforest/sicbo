import { Config, Inject, Provide } from '@midwayjs/core';
import Utils from '../comm/utils';
import RedisUtils from '../comm/redis';
import { BankerRecordMapping } from '../mapping/bankerRecord';
import { BANKER_RECORD_TYPE } from '../constant/game';
import { PlayerRecordMapping } from '../mapping/playerRecord';
import { Betting } from '../model/dto/game/game';
import MyError from '../comm/myError';

@Provide()
export class SicBoService {
  @Inject()
  utils: Utils;

  @Config('broadcastUrl')
  private broadcastUrl;

  @Config('bankerWallet')
  private bankerWallet;

  @Inject()
  bankerRecordMapping: BankerRecordMapping;

  @Inject()
  playerRecordMapping: PlayerRecordMapping;

  @Inject()
  redisUtils: RedisUtils;

  /**
   * @description decrypt betRecord
   * @param param
   * @returns
   */
  async getBettingRecord(param: Betting) {
    const { wallet, transactionId } = param;
    const url = this.broadcastUrl + transactionId;
    const res = await this.utils.fetch(url);
    const { execution } = res;
    const { transitions } = execution;
    const { outputs } = transitions[0];
    const [playerRecord, betRecord] = outputs;
    const playerCix = playerRecord.value;
    const betCix = betRecord.value;
    await this.playerRecordMapping.saveNew({
      wallet,
      cipherText: playerCix,
      used: 0,
    });

    const bankBetRecord = await this.decryptRecord(betCix);
    await this.bankerRecordMapping.saveNew({
      type: BANKER_RECORD_TYPE.BET,
      cipherText: betCix,
      record: bankBetRecord,
    });
    return { playerCix, betCix };
  }

  /**
   *@description send player chips
   * @param wallet
   * @returns
   */
  async sendChips(wallet: string) {
    const bankerChipsRecord = await this.bankerRecordMapping.getLastRecord(
      BANKER_RECORD_TYPE.CHIPS
    );
    try {
      const chips = '1000u64';
      const inputs = [bankerChipsRecord.record, wallet, chips];
      const res = await this._execRustSdk(inputs, '/sendchips');
      const [banKCiphertext, playerCiphertext] = res;
      const bankRecord = await this.decryptRecord(banKCiphertext);
      await this.bankerRecordMapping.saveNew({
        type: BANKER_RECORD_TYPE.CHIPS,
        cipherText: banKCiphertext,
        record: bankRecord,
      });

      await this.playerRecordMapping.saveNew({
        wallet,
        cipherText: playerCiphertext,
        used: 0,
      });

      return true;
    } catch (e) {
      throw new Error(e);
    } finally {
      await this.redisUtils.unLock('LOCK_RECORD');
    }
  }

  /**
   * @description
   * @param wallet
   */
  async settlement(wallet: string) {
    const bankerChipsRecord = await this.bankerRecordMapping.getLastRecord(
      BANKER_RECORD_TYPE.CHIPS
    );
    const bankerBetRecord = await this.bankerRecordMapping.getLastRecord(
      BANKER_RECORD_TYPE.BET
    );
    const bankerDiceRecord = await this.bankerRecordMapping.getLastRecord(
      BANKER_RECORD_TYPE.DICE
    );
    const inputs = [
      bankerDiceRecord.record,
      bankerBetRecord.record,
      bankerChipsRecord.record,
    ];
    const res = await this._execRustSdk(inputs, '/settlement');
    const [playerCiphertext, banKCiphertext] = res;
    const bankRecord = await this.decryptRecord(banKCiphertext);

    await this.bankerRecordMapping.saveNew({
      type: BANKER_RECORD_TYPE.CHIPS,
      cipherText: banKCiphertext,
      record: bankRecord,
    });

    await this.playerRecordMapping.saveNew({
      wallet,
      cipherText: playerCiphertext,
      used: 1,
    });
  }

  /**
   * @description exec sdk
   * @param input
   * @param url
   * @returns
   */
  private async _execRustSdk(input: any[], url: string) {
    for (let i = 0; i < 5; i++) {
      try {
        const res = await this.utils.sendRequest(url, input);
        return res;
      } catch (e) {
        console.log(`exec ${url} ERROR`);
      }
    }
    throw new MyError(`exec ${url} ERROR`);
  }

  /**
   * @description set dice
   * @param result
   * @param record
   * @returns
   */
  async setDice(dice: number) {
    const wallet = this.bankerWallet;
    const inputs = [wallet, `${dice}u8`];
    const res = await this._execRustSdk(inputs, '/setdice');
    const [diceCiphertext] = res;
    const bankRecord = await this.decryptRecord(diceCiphertext);
    await this.bankerRecordMapping.saveNew({
      type: BANKER_RECORD_TYPE.DICE,
      cipherText: diceCiphertext,
      record: bankRecord,
    });
  }
  /**
   * @description 解码
   * @param ciphertext
   * @param viewKey
   * @returns
   */
  async decryptRecord(ciphertext: string) {
    const url = '/decrypt';
    const res = await this.utils.sendRequest(url, ciphertext);
    return res.replace(/[\r\n]/g, '');
  }

  /**
   * @description 检查是否上链
   * @param transactionId
   * @returns
   */
  async checkOnChain(transactionId: string) {
    const baseUrl = this.broadcastUrl;
    const url = baseUrl + transactionId;
    try {
      const res = await this.utils.fetch(url);
      return res;
    } catch (e) {
      throw new MyError('transactionId not exist onchain');
    }
  }
}
