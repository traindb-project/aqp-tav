import { Synopsis } from '../dto';

export const SYNOPSIS_LIST: Synopsis[] = [
  {
    name: 'order_products_syn_bi',
    model: 'm_tablegan',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['add_to_cart_order', 'reordered'],
    rows: 100,
    ratio: '0.00007222',
    external: 'NO',
    status: 'ENABLED',
    statistics: '',
  },
  {
    name: 'order_products_syn_bimatrix',
    model: 'm_tablegan',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['add_to_cart_order', 'reordered'],
    rows: 100,
    ratio: '0.00007222',
    external: 'NO',
    status: 'ENABLED',
    statistics: '',
  },
  {
    name: 'tmp',
    model: 'New_Model',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['add_to_cart_order', 'order_id', 'product_id'],
    rows: 100,
    ratio: '0.00007222',
    external: 'NO',
    status: 'ENABLED',
    statistics: '',
  }
];
