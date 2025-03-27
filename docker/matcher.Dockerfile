FROM ubuntu:24.04

ARG UID=1000
ARG GID=1000

RUN apt update && apt install -y curl tini unzip
ENTRYPOINT ["/usr/bin/tini", "--"]

ARG APP_DIR=/app/
RUN mkdir -p $APP_DIR
RUN chown $UID:$GID $APP_DIR

# Create a system-wide directory for bun
RUN mkdir -p /usr/local/lib/bun
RUN chown $UID:$GID /usr/local/lib/bun

# Switch to the non-root user
USER $UID:$GID
WORKDIR $APP_DIR

# Install bun and copy it to system-wide location
ENV BUN_INSTALL=/usr/local/lib/bun
RUN curl -fsSL https://bun.sh/install | bash

# Copy application files
COPY services/matcher /app/services/matcher
COPY docker/matcher-start.sh /app/

# Start the service using the startup script
CMD ["/app/matcher-start.sh"]