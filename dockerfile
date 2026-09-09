FROM node:20-alpine

# Crear y establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo nodemon que está en devDependencies)
RUN npm install

# Copiar el resto del código del proyecto al contenedor
COPY . .

# Exponer el puerto 3000 que es donde corre tu servidor de Express
EXPOSE 3000

# Ejecutar tu script de desarrollo con nodemon
CMD ["npm", "run", "dev"]