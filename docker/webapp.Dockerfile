FROM ubuntu:24.04

ARG UID=1000
ARG GID=1000
# Add NODE_ENV argument with default value "development"
ARG NODE_ENV=development

RUN mkdir -p /tmp && chmod 1777 /tmp

RUN apt update && apt install -y curl tini unzip git
ENTRYPOINT ["/usr/bin/tini", "--"]

RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt install -y nodejs

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
COPY webapp /app/webapp
COPY docker/webapp-start.sh /app/

# Set a default environment mode that can be overridden at runtime
ENV NODE_ENV=${NODE_ENV:-development}

EXPOSE 5000

# Start the server using the startup script
CMD ["/app/webapp-start.sh"]