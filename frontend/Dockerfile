FROM node:14.14.0-alpine as build
WORKDIR /app
COPY ./package*.json ./
RUN npm i
COPY . .
ENV AWS_ACCESS_KEY YOUR_AWS_ACCESS_KEY
ENV AWS_SECRET_KEY YOUR_AWS_SECRET_KEY
ENV AWS_REGION eu-central-1
ENV DYNAMODB_TABLE_NAME recorded-audio
ENV REACT_APP_BUCKET_NAME recorded-audio-files
RUN npm run build

FROM nginx:stable-alpine
EXPOSE 3000
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]