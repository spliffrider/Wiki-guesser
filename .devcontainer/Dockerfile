# Wiki-Guesser Development Container
# Base: Node.js 22 LTS with common dev tools preinstalled
FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install Python 3.11 for data mining scripts
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-venv \
    python3-pip \
    git \
    curl \
    wget \
    procps \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Install Python dependencies globally for scripts
COPY scripts/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Set working directory
WORKDIR /workspaces/wiki-guesser

# Default to non-root user (comes with devcontainer base image)
USER node
