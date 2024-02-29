# We use an official Nginx image as a base
FROM nginx:alpine

# Copy static files to Nginx server
COPY src/frontend/view /usr/share/nginx/html
COPY src/frontend/main.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80

# Start Nginx when the container has provisioned
CMD ["nginx", "-g", "daemon off;"]
