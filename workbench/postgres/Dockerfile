FROM postgres:15.3

RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    sed -i 's/# ko_KR.UTF-8 UTF-8/ko_KR.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen

ENV LANG=ko_KR.utf8 \
    LANGUAGE=ko_KR:en \
    LC_ALL=ko_KR.UTF-8 \
    TZ=Asia/Seoul \
    LC_COLLATE=ko_KR.utf8 \
    POSTGRES_INITDB_ARGS=--data-checksums
