from pydantic import BaseModel


class Hyperparameter(BaseModel):
    modeltype: str
    name: str
    type: str
    default_value: str
    description: str
