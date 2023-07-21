import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'player',
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
export class PlayerEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(128),
    allowNull: false,
    field: 'wallet',
    comment: 'wallet',
  })
  wallet: string;

  @Column({
    type: DataType.DECIMAL(20, 10),
    allowNull: false,
    field: 'balance',
    defaultValue: '0',
    comment: 'player wallet',
  })
  balance: string;

  @Column({
    type: DataType.DECIMAL(20, 10),
    allowNull: false,
    defaultValue: 0,
    field: 'win_balance',
    comment: 'win balance',
  })
  winBalance: string;

  @Column({
    type: DataType.DECIMAL(20, 10),
    allowNull: false,
    defaultValue: 0,
    field: 'lose_balance',
    comment: 'lose balance',
  })
  loseBalance: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'win_count',
    comment: 'win count',
  })
  winCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'lose_count',
    comment: 'lose count',
  })
  loseCount: number;
}
