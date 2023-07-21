import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'game_record',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [{ name: 'id' }],
    },
  ],
})
export class GameRecordEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'wallet',
    comment: 'player wallet',
  })
  wallet: number;

  @Column({
    type: DataType.DECIMAL(20, 10),
    allowNull: false,
    field: 'bet_balance',
    comment: 'bet balance',
  })
  betBalance: string;

  @Column({
    type: DataType.TINYINT({
      length: 2,
      unsigned: true,
    }),
    allowNull: false,
    defaultValue: 0,
    field: 'bet_result',
    comment: 'bet result ',
  })
  betResult: number;

  @Column({
    type: DataType.ENUM('wait', 'win', 'lose'),
    allowNull: false,
    defaultValue: 'wait',
    field: 'game_result',
    comment: 'game result',
  })
  gameResult: string;

  @Column({
    type: DataType.INTEGER({
      unsigned: true,
      length: 4,
    }),
    allowNull: false,
    defaultValue: 0,
    field: 'game_dice',
    comment: 'game dice',
  })
  gameDice: number;
}
