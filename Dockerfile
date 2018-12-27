FROM python:3.6.7-slim

LABEL maintainer "Amaris <amaris@amaris.ai>"

SHELL ["/bin/bash", "-c"]

# Set environment variables

ENV USER_NAME amaris
ENV APP_HOME /home/$USER_NAME/
ENV PROJ_NAME MotionFacialBot

# Configure user and working directory

RUN useradd -ms /bin/bash $USER_NAME

RUN apt-get -y update
RUN apt-get install -y --fix-missing \
    build-essential \
    cmake \
    gfortran \
    git \
    wget \
    curl \
    graphicsmagick \
    libgraphicsmagick1-dev \
    libatlas-dev \
    libavcodec-dev \
    libavformat-dev \
    libgtk2.0-dev \
    libjpeg-dev \
    liblapack-dev \
    libswscale-dev \
    pkg-config \
    python3-dev \
    python3-numpy \
    software-properties-common \
    zip \
    && apt-get clean && rm -rf /tmp/* /var/tmp/*

RUN cd ~ && \
    mkdir -p dlib && \
    git clone -b 'v19.9' --single-branch https://github.com/davisking/dlib.git dlib/ && \
    cd  dlib/ && \
    python3 setup.py install --yes USE_AVX_INSTRUCTIONS

RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN apt-get install -y nodejs
RUN apt-get clean -y

RUN curl -L https://github.com/docker/compose/releases/download/1.15.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
RUN chmod +x /usr/local/bin/docker-compose

ARG CACHEBUST=1

COPY . $APP_HOME/$PROJ_NAME

WORKDIR $APP_HOME/$PROJ_NAME

RUN pip install --trusted-host pypi.python.org -r server/requirements.txt

RUN chown -R ${1:-`id -u ${user}`}:$USER_NAME $APP_HOME/$PROJ_NAME && chmod -R +x $APP_HOME/$PROJ_NAME

RUN cd $APP_HOME/$PROJ_NAME/facepose-demos && npm install

EXPOSE 3000 9997
