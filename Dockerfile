FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.12-slim AS backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY --from=backend /app /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache python3 py3-pip && \
    pip install --no-cache-dir uvicorn fastapi sqlalchemy python-jose passlib python-multipart pydantic
EXPOSE 80
CMD sh -c "nginx && cd /app && uvicorn main:app --host 0.0.0.0 --port 8000 & wait"
