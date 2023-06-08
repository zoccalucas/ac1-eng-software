import { Request, Response } from 'express';

import { Controller } from '../../presentation/protocols';

export const adaptRoute = (constroller: Controller) => {
  return async (req: Request, res: Response) => {
    const httpRequest = {
      body: req.body
    };
    const httpResponse = await constroller.handle(httpRequest);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  };
};
