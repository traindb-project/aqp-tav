from pydantic import BaseModel


class ModeltypeDto(BaseModel):
    name: str | None = None
    category: str | None = None
    location: str | None = None
    className: str | None = None
    uri: str | None = None


class FindModeltypeDto(ModeltypeDto):
    pass


class CreateModeltypeDto(ModeltypeDto):
    pass
