export interface Modeltype {
  name: string;
  category: string;
  location: string;
  className: string;
  uri: string;
}

export interface FindModeltypeDto extends Modeltype {}

export interface CreateModeltypeDto extends Modeltype {}
