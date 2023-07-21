import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';
import { QueryParamDTO } from '../base';

export class lotteryDTO {
  @ApiProperty({
    type: 'string',
    description: '钱包',
  })
  @Rule(RuleType.string().required())
  wallet: string;

  @ApiProperty({
    type: 'number',
    description: '金额',
  })
  @Rule(RuleType.number().required())
  amount: number;

  @ApiProperty({
    type: 'number',
    description: '猜测结果',
  })
  @Rule(RuleType.number().required())
  guess: number;
}

export class QueryRecordDTO extends QueryParamDTO {
  @ApiProperty({
    type: 'string',
    description: 'wallet',
  })
  @Rule(RuleType.string().required())
  wallet: string;
}

export class Betting {
  @ApiProperty({
    type: 'string',
    description: 'wallet',
  })
  @Rule(RuleType.string().required())
  wallet: string;

  @ApiProperty({
    type: 'string',
    description: 'bet transactionId',
  })
  @Rule(RuleType.string().required())
  transactionId: string;
}
