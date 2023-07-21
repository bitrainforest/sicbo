import { Rule, RuleType } from '@midwayjs/validate';
import { ApiProperty } from '@midwayjs/swagger';

export class QueryParamDTO {
  @ApiProperty({
    type: 'integer',
    example: '1',
    description: 'page',
  })
  @Rule(RuleType.number().default(1).required())
  page: number;

  @ApiProperty({
    type: 'integer',
    example: '1',
    description: 'limit',
  })
  @Rule(RuleType.number().default(10).required())
  limit: number;
}
