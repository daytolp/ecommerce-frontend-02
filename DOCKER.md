# Docker Configuration para Angular Frontend

Este proyecto incluye configuración completa de Docker para desarrollo y producción.

## Archivos Docker

- **Dockerfile**: Configuración multi-stage para build y producción
- **docker-compose.yml**: Orquestación de servicios
- **nginx.conf**: Configuración de Nginx para servir la aplicación Angular
- **nginx-proxy.conf**: Configuración de proxy reverso
- **.dockerignore**: Archivos excluidos del contexto Docker

## Comandos para ejecutar

### Desarrollo rápido
```bash
# Construir y levantar todos los servicios
docker-compose up --build

# Ejecutar en background
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### Comandos individuales
```bash
# Solo construir la imagen
docker build -t angular-frontend-02 .

# Ejecutar solo el frontend
docker run -p 4200:80 angular-frontend-02
```

### Gestión del entorno
```bash
# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir forzando
docker-compose up --build --force-recreate
```

## Puertos

- Frontend: http://localhost:4200
- Nginx Proxy: http://localhost:80

## Notas

- La aplicación se sirve a través de Nginx en producción
- Configuración optimizada con compresión gzip
- Headers de seguridad incluidos
- Manejo correcto de rutas de Angular SPA
