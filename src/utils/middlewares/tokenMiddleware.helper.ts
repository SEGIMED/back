import { NextFunction, Request, Response } from 'express';
import { AuthHelper } from '../auth.helper';
import { BadRequestException } from '@nestjs/common';

export const tokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers['authorization'];
  if (!authorization) {
    throw new BadRequestException('Authorization header is missing');
  }

  const token = authorization.replace('Bearer ', '');
  try {
    const payload = AuthHelper.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req['user'] = payload;
    next();
  } catch {
    throw new BadRequestException('Invalid token');
  }
};
