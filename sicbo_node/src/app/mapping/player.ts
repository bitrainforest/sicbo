import { Provide } from '@midwayjs/decorator';

import { PlayerEntity } from '../entity/player';
import { BaseMapping } from '../../core/baseMapping';

@Provide()
export class PlayerMapping extends BaseMapping<PlayerEntity> {
  getModel() {
    return PlayerEntity;
  }
}
