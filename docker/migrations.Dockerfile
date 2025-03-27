FROM ubuntu:24.04

ARG UID=1000
ARG GID=1000

RUN apt update && apt install -y curl tini unzip
ENTRYPOINT ["/usr/bin/tini", "--"]

ARG APP_DIR=/app/
RUN mkdir -p $APP_DIR
RUN chown $UID:$GID $APP_DIR
USER $UID:$GID
WORKDIR $APP_DIR

RUN curl -fsSL https://bun.sh/install | bash

# Copy package files and migration files
COPY db /app/db
COPY docker/migrations-start.sh /app/

CMD ["/app/migrations-start.sh"]