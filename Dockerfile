FROM node:8.9.0-onbuild

EXPOSE 3000

ENV PORT 3000
ENV HOST "0.0.0.0"

CMD ["node", "server.js"]

