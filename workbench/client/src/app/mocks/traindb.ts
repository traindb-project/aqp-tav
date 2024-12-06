import { FindTrainDBDto } from '../dto';

export const TRAINDB_LIST: FindTrainDBDto[] = [
  {
    id: 1,
    name: 'Etri TrainDB',
    host: '192.168.0.1',
    port: 58000,
    username: null,
    password: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: 'Bimatrix TrainDB',
    host: '192.168.0.1',
    port: 58000,
    username: null,
    password: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    name: 'Test TrainDB1',
    host: '192.168.0.1',
    port: 58000,
    username: null,
    password: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 4,
    name: 'Test TrainDB2',
    host: '192.168.0.1',
    port: 58001,
    username: null,
    password: null,
    created_at: new Date(),
    updated_at: new Date(),
  }
];
