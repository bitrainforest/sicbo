import { Provide } from '@midwayjs/decorator';

import { BaseMapping } from '../../core/baseMapping';
import { BankerRecordEntity } from '../entity/bankerRecord';
import { BANKER_RECORD_TYPE } from '../constant/game';

@Provide()
export class BankerRecordMapping extends BaseMapping<BankerRecordEntity> {
  getModel() {
    return BankerRecordEntity;
  }

  async getLastRecord(type: BANKER_RECORD_TYPE) {
    const res = await this.findAll(
      {
        type,
      },
      {
        limit: 1,
        order: [['id', 'desc']],
      }
    );
    return res[0];
  }
}
