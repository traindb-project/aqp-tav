import { Column } from '../dto';

export const COLUMN_LIST: Column[] = [
  {
    name: 'order_id',
    type: 'INTEGER NOT NULL'
  },
  {
    name: 'product_id',
    type: 'INTEGER NOT NULL'
  },
  {
    name: 'add_to_cart_order',
    type: 'INTEGER NOT NULL'
  },
  {
    name: 'reordered',
    type: 'INTEGER NOT NULL'
  }
];
