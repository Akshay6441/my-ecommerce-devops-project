# frontend/Dockerfile
# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . ./ 
# This ARG and ENV will inject the backend URL into the React build process
ARG REACT_APP_BACKEND_URL_ARG
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL_ARG}
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:stable-alpine
# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]