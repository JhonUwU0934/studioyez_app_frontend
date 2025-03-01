# Usa una imagen base de Node.js para construir la aplicación
FROM node:18 AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios
COPY package.json ./

# Instala las dependencias específicas primero
#RUN npm install @ng-bootstrap/ng-bootstrap@latest

# Instala las dependencias
RUN npm install --legacy-peer-deps

RUN npm install
# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación Angular
RUN npm run build -- --configuration=production

# Usa una imagen base de Nginx para servir la aplicación
FROM nginx:alpine

# Copia los archivos de construcción al directorio predeterminado de Nginx
COPY --from=builder /app/dist/acr_plus_clients_view /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
