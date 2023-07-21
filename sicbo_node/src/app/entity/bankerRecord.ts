import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'banker_record',
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
export class BankerRecordEntity extends Model {
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
    field: 'cipher_text',
    comment: 'banker cipherText',
  })
  cipherText: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'record',
    comment: 'Decrypt record',
  })
  record: string;

  @Column({
    type: DataType.ENUM('chips', 'dice', 'init', 'bet'),
    allowNull: false,
    field: 'type',
    comment: 'game type',
  })
  type: string;
}
