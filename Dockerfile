# ============================================
# Etapa 1: Construcción del proyecto Angular
# ============================================
FROM node:22-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente del proyecto
COPY . .

# Construir la aplicación Angular para producción
RUN npm run build

# ============================================
# Etapa 2: Servir la aplicación con NGINX
# ============================================
FROM nginx:alpine

# Puerto que Cloud Run espera (8080)
ENV PORT=8080

# Configuración personalizada de NGINX para usar el puerto 8080
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 404 /index.html; \
}' > /etc/nginx/conf.d/default.conf

# Copiar el build generado por Angular
COPY --from=build /app/dist/HotelSoft/browser /usr/share/nginx/html

# Exponer el puerto
EXPOSE 8080

# Mantener NGINX corriendo en primer plano
CMD ["nginx", "-g", "daemon off;"]



