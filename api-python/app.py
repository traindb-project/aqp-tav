from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

import oracle
from model.request import Query

app = FastAPI()

origins = [
    '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/echo')
async def get_echo(query: Query):
    return query.query


@app.post('/api/echo')
async def post_echo(query: Query):
    return query.query


@app.post('/api/query')
async def request_query(request: Request, query: Query):
    return oracle.query(query.query)


@app.on_event('shutdown')
def shutdown():
    oracle.close()
