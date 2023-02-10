FROM node:19

WORKDIR /app

RUN npm install -g pnpm

RUN git clone https://github.com/jamesgopsill/bam-living-lab-broker .

RUN pnpm install

RUN pnpm build:dist
