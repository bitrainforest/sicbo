import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'player_record',
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
export class PlayerRecordEntity extends Model {
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
    type: DataType.TEXT,
    allowNull: false,
    field: 'cipher_text',
    comment: 'player cipherText',
  })
  cipherText: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'used',
    comment: '1: needUse',
  })
  used: string;
}
