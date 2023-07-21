import { Provide } from '@midwayjs/decorator';

import { BaseMapping } from '../../core/baseMapping';
import { GameRecordEntity } from '../entity/gameRecord';

@Provide()
export class GameRecordMapping extends BaseMapping<GameRecordEntity> {
  getModel() {
    return GameRecordEntity;
  }

  async getLastGame() {
    const res = await this.findAll(
      {},
      {
        limit: 1,
        order: [['id', 'desc']],
      }
    );
    return res[0];
  }
}
