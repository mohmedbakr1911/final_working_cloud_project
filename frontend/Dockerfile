FROM nginx:alpine

# 1. Clear out the default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy ONLY the contents of your public folder
# This puts your index.html exactly where Nginx expects it
COPY public/ /usr/share/nginx/html/

EXPOSE 80