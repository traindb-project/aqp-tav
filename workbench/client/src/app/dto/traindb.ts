export interface TrainDB {
  host: string;
  port: number | string;
  username: string | null;
  password: string | null;
}

export interface FindTrainDBDto extends TrainDB {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTrainDBDto extends TrainDB {
  name: string;
}

export interface UpdateTrainDBDto extends TrainDB {
  name: string;
}

export interface TestTrainDBConnectionRequestDto extends TrainDB {}

export interface TestTrainDBConnectionResponseDto {
  success: boolean;
}
