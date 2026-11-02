-- Esquema inicial del Trabajo Final Integrador.
-- PostgreSQL ejecuta este archivo automáticamente al crear el volumen de la base.

CREATE TYPE estados_usuarios_enum AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE roles_usuarios_enum AS ENUM ('MEDICO', 'PACIENTE', 'ADMINISTRADOR');
CREATE TYPE estados_reservas_enum AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  documento TEXT NOT NULL UNIQUE,
  apellidos TEXT NOT NULL,
  nombres TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  clave TEXT NOT NULL,
  estado estados_usuarios_enum NOT NULL DEFAULT 'ACTIVO',
  rol roles_usuarios_enum NOT NULL
);

CREATE TABLE medicos (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  matricula INTEGER NOT NULL,
  valor_consulta INTEGER NOT NULL CHECK (valor_consulta > 0)
);

CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  id_medico INTEGER NOT NULL REFERENCES medicos(id),
  id_paciente INTEGER NOT NULL REFERENCES usuarios(id),
  fecha_hora TIMESTAMPTZ NOT NULL,
  estado estados_reservas_enum NOT NULL DEFAULT 'ACTIVO',
  valor_consulta INTEGER NOT NULL CHECK (valor_consulta > 0)
);

-- Evita dobles reservas incluso cuando dos solicitudes llegan al mismo tiempo.
-- Una reserva cancelada libera el horario para una nueva reserva.
CREATE UNIQUE INDEX uq_reservas_medico_fecha_activa
  ON reservas (id_medico, fecha_hora)
  WHERE estado = 'ACTIVO';

CREATE INDEX ix_reservas_paciente_fecha ON reservas (id_paciente, fecha_hora);
CREATE INDEX ix_reservas_medico_fecha ON reservas (id_medico, fecha_hora);

-- Usuarios de ejemplo para la demostración local. Cambiar estas claves fuera de desarrollo.
INSERT INTO usuarios (documento, apellidos, nombres, email, clave, estado, rol) VALUES
  ('DEMO-0001', 'Administrador', 'Clínica', 'admin@clinica.com', '$2b$10$QTMdKtPFbD6KDhrTiCPoy.teqEPgt6T2vmnOA1jiOTMbsNciL62XO', 'ACTIVO', 'ADMINISTRADOR'),
  ('DEMO-0002', 'Gómez', 'María', 'paciente@clinica.com', '$2b$10$riY6rgZZY6YYXUOkzsjvs.ljIOfhTDZb7nGw8zPUoHLNT0JTT/mmO', 'ACTIVO', 'PACIENTE'),
  ('DEMO-0003', 'Pérez', 'Carlos', 'medico@clinica.com', '$2b$10$bbhDC9XUnCeyJDEuTjzfruy5LOxu6vLPWa3par.RpM7wNG5Eys3p2', 'ACTIVO', 'MEDICO');

INSERT INTO medicos (id_usuario, matricula, valor_consulta)
SELECT id, 45890, 18000 FROM usuarios WHERE email = 'medico@clinica.com';
