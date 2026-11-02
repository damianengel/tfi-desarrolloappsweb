import { SetMetadata } from '@nestjs/common';
import { RolesUsuarios } from '../../common/enums/roles-estados.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesUsuarios[]) => SetMetadata(ROLES_KEY, roles);