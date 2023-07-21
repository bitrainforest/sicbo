import { Provide } from '@midwayjs/decorator';

import { PlayerRecordEntity } from '../entity/playerRecord';
import { BaseMapping } from '../../core/baseMapping';

@Provide()
export class PlayerRecordMapping extends BaseMapping<PlayerRecordEntity> {
  getModel() {
    return PlayerRecordEntity;
  }

  async getLastRecord(wallet: string) {
    const res = await this.findAll(
      {
        wallet,
        used: 0,
      },
      {
        limit: 1,
        order: [['id', 'desc']],
      }
    );
    return res[0];
  }
}
