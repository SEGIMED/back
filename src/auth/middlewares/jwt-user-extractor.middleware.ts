import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthHelper } from '../../utils/auth.helper';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtUserExtractorMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers['authorization'];
      if (!authorization) {
        next();
        return;
      }

      const token = authorization.replace('Bearer ', '');
      try {
        const payload = AuthHelper.verifyToken(token);
        if (typeof payload === 'string') {
          next();
          return;
        }

        // Extraer el ID del usuario del payload
        const userId = payload.id;
        if (!userId) {
          next();
          return;
        }

        // Obtener información del usuario desde la base de datos
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            last_name: true,
            role: true,
            tenant_id: true,
          },
        });

        if (user) {
          // Agregar el usuario a la solicitud
          req['user'] = user;
        }
      } catch (error) {
        // Si hay un error al verificar el token, simplemente continuar
        console.error('Error al verificar token JWT:', error);
      }

      next();
    } catch (error) {
      console.error('Error en middleware JWT:', error);
      next();
    }
  }
}
