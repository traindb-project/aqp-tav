FROM ubuntu:22.04

ENV LANG=ko_KR.UTF-8 \
    LANGUAGE=ko_KR:en \
    LC_ALL=ko_KR.UTF-8 \
    TZ=Asia/Seoul \
    PYTHONPATH=${PYTHONPATH}:/opt/shared/libs

RUN ln -sf /usr/share/zoneinfo/${TZ} /etc/localtime
RUN echo ${TZ} > /etc/timezone

RUN rm -rf /var/lib/apt/lists/*
RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get install -y python3.11 && \
    apt-get install -y python3.11-dev && \
    apt-get install -y python3-pip && \
    ln -Tfs /usr/bin/python3.11 /usr/bin/python && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
RUN export JAVA_HOME

WORKDIR /app
COPY requirements.txt ./

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY ./app ./

CMD celery -A main worker --loglevel=info
