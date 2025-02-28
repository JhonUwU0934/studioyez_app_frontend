# Utilizamos la imagen base de Node.js
FROM node:18 as build-stage

# Instalamos Angular CLI globalmente en la etapa de construcción
RUN npm install -g @angular/cli

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de configuración e instalamos las dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# Modificamos los límites de tamaño en la configuración de Angular para los archivos que exceden los límites
RUN sed -i 's_"budgets": \[\]_"budgets": [{"type": "any", "name": "auth/pages/login/login.component.scss", "maximumWarning": "4mb", "maximumError": "4mb"}, {"type": "any", "name": "auth/pages/register/register.component.scss", "maximumWarning": "4mb", "maximumError": "4mb"}, {"type": "any", "name": "home/pages/home/home.component.scss", "maximumWarning": "4mb", "maximumError": "4mb"}]_' angular.json

# Construimos la aplicación en modo de producción
RUN ng build --configuration=production

# Nueva etapa del Dockerfile para el servidor de desarrollo de Angular
FROM nginx:alpine

# Copiamos los archivos compilados de la etapa de construcción al servidor Nginx
COPY --from=build-stage /app/dist/studio_yez_app_frontend /usr/share/nginx/html

# Exponemos el puerto 80 para el servidor Nginx
EXPOSE 80

# No se necesita un comando CMD ya que Nginx se inicia automáticamente
