FROM instructure/node:8

ENV MARATHON_URL http://marathon.mesos:8080
COPY package.json package-lock.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/

WORKDIR /usr/src/app/
USER root
RUN chown -R docker .
USER docker
CMD ["node", "bin/marathon-elb.js", "run", "-c", "dockerConfig.js"]
