import { Modeltype } from '../dto';

export const MODELTYPE_LIST: Modeltype[] = [
  {
    name: 'rspn',
    category: 'INFERENCE',
    location: 'REMOTE',
    className: 'RSPN',
    uri: 'http://192.168.0.1:58080/',
  },
  {
    name: 'tablegan',
    category: 'SYNOPSIS',
    location: 'REMOTE',
    className: 'CTGAN',
    uri: 'http://192.168.0.1:58080/',
  },
  {
    name: 'ctgan',
    category: 'SYNOPSIS',
    location: 'REMOTE',
    className: 'OCTGAN',
    uri: 'http://192.168.0.1:58080/',
  },
  {
    name: 'octgan',
    category: 'SYNOPSIS',
    location: 'REMOTE',
    className: 'STASY',
    uri: 'http://192.168.0.1:58080/',
  },
  {
    name: 'stasy',
    category: 'SYNOPSIS',
    location: 'REMOTE',
    className: 'TVAE',
    uri: 'http://192.168.0.1:58080/',
  },
  {
    name: 'tvae',
    category: 'SYNOPSIS',
    location: 'REMOTE',
    className: 'TableGAN',
    uri: 'http://192.168.0.1:58080/',
  },
  {
    name: 'local_tvae',
    category: 'SYNOPSIS',
    location: 'LOCAL',
    className: 'TableGAN',
    uri: 'models/TableGAN.py',
  },
];
