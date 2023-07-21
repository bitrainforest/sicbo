import { Inject, Provide } from '@midwayjs/core';

import { BaseService } from '../../core/baseService';
import RedisUtils from '../comm/redis';
import { GAME_STATUS } from '../constant/game';
import MyError from '../comm/myError';
import { GameRecordEntity } from '../entity/gameRecord';
import { GameRecordMapping } from '../mapping/gameRecord';
import { PlayerService } from './player';
import { SicBoService } from './sicbo';
import { Betting, QueryRecordDTO, lotteryDTO } from '../model/dto/game/game';
import { BankerRecordMapping } from '../mapping/bankerRecord';

@Provide()
export class GameService extends BaseService<GameRecordEntity> {
  @Inject()
  mapping: GameRecordMapping;

  @Inject()
  playerService: PlayerService;

  @Inject()
  sicBoService: SicBoService;

  @Inject()
  redisUtils: RedisUtils;

  @Inject()
  bankerRecordMapping: BankerRecordMapping;

  /**
   * @description player want bet
   * @param wallet
   * @param betNum
   * @param betResult
   * @returns
   */
  async wantBet(param: lotteryDTO) {
    const { wallet, amount, guess } = param;
    const key = 'SICBO_GAME';
    const gameStatusStr = await this.redisUtils.getString(key);
    const { status, betWallet, dice } = JSON.parse(gameStatusStr);
    if (status !== GAME_STATUS.OPENING) {
      throw new MyError('not yet at the betting stage');
    }
    const betKey = 'bet_wallet';
    const betLock = await this.redisUtils.getLock(betKey, 15 * 60);
    if (!betLock) {
      const msg =
        betWallet === wallet
          ? 'You have already placed a bet, waiting for the draw, please do not repeat the bet'
          : 'Others have placed their bets and are waiting for the draw';
      throw new MyError(msg);
    }
    const gameStatus = {
      status: GAME_STATUS.BET,
      betWallet: wallet,
      betAmount: amount,
      guess,
      dice,
      statusTime: new Date().getTime(),
    };
    await this.redisUtils.setValue(key, JSON.stringify(gameStatus));
    return true;
  }

  async lottery(param: Betting) {
    try {
      await this.sicBoService.getBettingRecord(param);
    } catch (e) {
      throw new MyError('bet transaction error');
    }
    // modify Game status
    const key = 'SICBO_GAME';
    const gameStatusStr = await this.redisUtils.getString(key);
    const gameStatusObj = JSON.parse(gameStatusStr);
    gameStatusObj.status = GAME_STATUS.LOTTERY;
    gameStatusObj.statusTime = new Date().getTime();

    const { betWallet, betAmount, guess, dice } = gameStatusObj;
    if (betWallet !== param.wallet) {
      throw new MyError('lottery wallet is not bet wallet ');
    }
    const lock = await this.redisUtils.getLock('lock_lottery', 10 * 60);
    if (!lock) {
      throw new MyError('Do not repeat the lottery');
    }

    // modify game record
    await this.redisUtils.setValue(key, JSON.stringify(gameStatusObj));
    const game = await this.mapping.getLastGame();
    const gameResult = dice > 10 ? 2 : 1;
    const gameBalance = guess === gameResult ? betAmount : -betAmount;
    await this.mapping.modify(
      {
        wallet: betWallet,
        betBalance: betAmount,
        betResult: guess,
        gameResult: guess === gameResult ? 'win' : 'lose',
        gameDice: dice,
      },
      {
        id: game.id,
      }
    );
    const modifyBalance = {
      balance: gameBalance,
      winBalance: guess === gameResult ? gameBalance : 0,
      loseBalance: guess === gameResult ? 0 : betAmount,
      winCount: guess === gameResult ? 1 : 0,
      loseCount: guess === gameResult ? 0 : 1,
    };
    await this.playerService.addBalance(modifyBalance, betWallet);

    // sicbo settlement and setdice
    process.nextTick(async () => {
      try {
        await this.sicBoService.settlement(betWallet);
      } catch (e) {
        throw new MyError('settlement error');
      }
      await this.redisUtils.unLock('lock_lottery');

      await this.setDice();
    });
    return {
      gameResult: guess === gameResult ? 'win' : 'lose',
      betAmount: betAmount * 2,
      dice,
    };
  }

  /**
   * @description set dice
   */
  async setDice() {
    const betKey = 'bet_wallet';
    await this.redisUtils.unLock(betKey);
    const max = 18;
    const min = 3;
    const gameDice = Math.floor(Math.random() * (max - min + 1) + min);

    await this.sicBoService.setDice(gameDice);
    const gameStatus = {
      status: GAME_STATUS.OPENING,
      betWallet: '',
      betAmount: 0,
      guess: '',
      dice: gameDice,
      statusTime: new Date().getTime(),
    };
    const key = 'SICBO_GAME';
    await this.redisUtils.setValue(key, JSON.stringify(gameStatus));
    await this.mapping.saveNew({
      wallet: '',
      betBalance: 0,
      betResult: 0,
      gameDice,
    });
  }

  /**
   * @description getRecordList
   * @param param
   * @returns
   */
  async getRecordList(param: QueryRecordDTO) {
    const { wallet, page, limit } = param;
    const res = await this.mapping.findAndCountAll(limit, page, {
      wallet,
    });
    return res;
  }

  /**
   * @description getUserStatus
   * @returns
   */
  async getGameStatus() {
    const key = 'SICBO_GAME';
    const gameStatusStr = await this.redisUtils.getString(key);
    const gameStatus = JSON.parse(gameStatusStr);
    const { status } = gameStatus;
    return status;
  }

  async unlockGameStatus() {
    const key = 'SICBO_GAME';
    const gameStatusStr = await this.redisUtils.getString(key);
    const gameStatus = JSON.parse(gameStatusStr);
    const { status, statusTime } = gameStatus;
    if (status === GAME_STATUS.BET || status === GAME_STATUS.LOTTERY) {
      const nowTime = new Date().getTime();
      const limitTime = 40 * 1000 * 60;
      const diffTime = nowTime - statusTime;
      if (diffTime > limitTime) {
        gameStatus.status = GAME_STATUS.OPENING;
        gameStatus.statusTime = new Date().getTime();
        await this.redisUtils.setValue(key, JSON.stringify(gameStatus));
      }
    }
    return true;
  }
}
