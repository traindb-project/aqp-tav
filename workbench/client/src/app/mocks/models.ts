import { Model } from '../dto';

export const MODEL_LIST: Model[] = [
  {
    name: 'm_tablegan',
    modeltype: 'tablegan',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['product_id', 'order_id', 'add_to_cart_order', 'reordered'],
    table_rows: 1384617,
    trained_rows: 1384617,
    status: 'ENABLED',
    server: 'http://192.168.0.64:58080/',
    start: '2023-12-19 17:47:04.000000',
    training_status: 'FINISHED',
    options: { 'epochs': 1 },
  },
  {
    name: 'New_Model',
    modeltype: 'tablegan',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['add_to_cart_order', 'order_id', 'product_id'],
    table_rows: 1384617,
    trained_rows: 1384617,
    status: 'DISABLED',
    server: null,
    start: null,
    training_status: null,
    options: { 'epochs': 1 },
  },
  {
    name: 'test_tgan',
    modeltype: 'tablegan',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['reordered', 'add_to_cart_order'],
    table_rows: 1384617,
    trained_rows: 1384617,
    status: 'ENABLED',
    server: 'http://192.168.0.64:58080/',
    start: '2024-05-24 11:08:39.000000',
    training_status: 'TRAINING',
    options: { 'epochs': 1 },
  },
  {
    name: 'test_rspn',
    modeltype: 'rspn',
    schema: 'instacart_small',
    table: 'order_products',
    columns: ['reordered', 'add_to_cart_order'],
    table_rows: 1384617,
    trained_rows: 1384617,
    status: 'ENABLED',
    server: 'http://192.168.0.64:58080/',
    start: '2024-05-24 11:08:39.000000',
    training_status: 'FINISHED',
    options: { 'epochs': 1 },
  },
];
