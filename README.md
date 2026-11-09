# Clínica Oliva — Trabajo Final Integrador 2026

Aplicación web para la gestión de turnos de una clínica médica. Está construida con **Angular**, **NestJS**, **TypeORM** y **PostgreSQL**; el despliegue local de demostración incluye **nginx** y ejecuta la API con **PM2**.

## Puesta en marcha recomendada (Docker)

1. Instalá **Docker Desktop** para Windows y dejalo iniciado. La computadora de este proyecto todavía no tiene el comando `docker` disponible.
2. En la carpeta raíz del proyecto, creá la configuración local a partir del ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

   Para una entrega real, reemplazá `POSTGRES_PASSWORD` y `JWT_SECRET` por valores privados. No subas el `.env` al repositorio.
3. Desde esa misma carpeta, construí e iniciá los servicios:

   ```powershell
   docker compose up --build -d
   docker compose ps
   ```

4. Abrí la aplicación en **http://localhost:8080**. La documentación Swagger queda en **http://localhost:8080/api/docs**.

PostgreSQL crea el esquema y las cuentas demo al inicializar el volumen por primera vez, usando `database/init/001-schema.sql`. Las variables de `docker-compose.yml` conectan la API al contenedor PostgreSQL. La API no altera el esquema automáticamente (`DB_SYNCHRONIZE=false`).

### Cuentas locales de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin@clinica.com` | `Admin123!` |
| Paciente | `paciente@clinica.com` | `Paciente123!` |
| Médico | `medico@clinica.com` | `Medico123!` |

Son credenciales **solo para desarrollo/demo**. La gestión de usuarios y roles no forma parte de este alcance: la aplicación únicamente consulta usuarios existentes y valida que estén activos.

## Alternativa para desarrollo sin nginx

La base PostgreSQL debe estar instalada y ejecutándose localmente, con el usuario/base definidos en `backend/.env`. Si todavía no existe el archivo, copialo desde el ejemplo (no sobrescribas un `.env` que ya tengas):

```powershell
Copy-Item backend/.env.example backend/.env
```

Creá la base `clinica_db` y aplicá una vez el esquema inicial desde una terminal con `psql` disponible:

```sql
CREATE USER clinica WITH PASSWORD 'clinica_dev';
CREATE DATABASE clinica_db OWNER clinica;
```

Ejecutá esas sentencias desde `psql` con un usuario administrador de PostgreSQL. Luego, desde la raíz del proyecto:

```powershell
psql -U clinica -d clinica_db -f database/init/001-schema.sql
```

En dos terminales, desde la raíz del proyecto:

```powershell
cd backend
npm ci
npm run start:dev
```

```powershell
cd frontend
npm ci
npm start
```

Angular usa el proxy relativo `frontend/proxy.conf.json` para enviar `/api` a `http://localhost:3000`. La web de desarrollo queda en **http://localhost:4200**.

## Funcionalidades por rol

- **Paciente:** consulta médicos y horarios libres, reserva turnos, lista sus turnos y cancela hasta el día anterior a la consulta.
- **Médico:** filtra su agenda por fecha y, desde la hora de inicio del turno, lo marca como atendido o ausente.
- **Administrador:** lista las reservas, reserva para un paciente activo, cancela antes del inicio de la consulta y actualiza los valores de consulta.
- **Reglas comunes:** atención de 08:00 a 16:00; turnos de una hora que comienzan en punto; máximo 30 días de anticipación; no se permite superponer reservas activas. El valor se guarda en la reserva al confirmarla y no cambia si luego se actualiza el valor del médico.
- La zona horaria clínica predeterminada es `America/Argentina/Buenos_Aires` (`CLINIC_TIMEZONE`).

## API y documentación

- `POST /api/auth/login` — autenticación (solo usuarios `ACTIVO`).
- `GET /api/medicos` — listado de profesionales activos.
- `GET /api/reservas` — reservas propias por paciente, del día por médico (`?fecha=AAAA-MM-DD`) o todas para administrador.
- `GET /api/reservas/disponibilidad?id_medico=1&fecha=AAAA-MM-DD` — horarios libres para pacientes y administradores.
- `POST /api/reservas` — crear una reserva.
- `PATCH /api/reservas/:id/cancelar` — cancelar según rol y regla de fecha/hora.
- `PATCH /api/reservas/:id/estado-medico` — marcar como `ATENDIDO` o `AUSENTE`.
- `PATCH /api/medicos/:id/valor-consulta` — modificar el precio (administrador).
- `GET /api/usuarios/pacientes` — consulta de pacientes activos para una reserva administrativa; no crea ni modifica usuarios.
- Swagger: `/api/docs`. Compodoc: desde `backend`, `npm run docs:build` (genera `backend/documentation`) o `npm run docs` para verlo localmente.

Las entradas se validan con DTOs y `ValidationPipe`; las respuestas se transforman a DTOs que no exponen claves, documentos ni otros datos innecesarios.

## Pruebas y comandos de demostración

```powershell
cd backend
npm test
npm run build
npm run docs:build
```

```powershell
cd frontend
npm test -- --watch=false
npm run build
```

Con Docker iniciado, para evidenciar nginx y PM2 durante la presentación:

```powershell
docker compose ps
docker compose exec api pm2 status
docker compose exec web nginx -v
docker compose logs api
```
## Link al video en youtube:

**https://youtu.be/PUY6bJA7_1g**.



