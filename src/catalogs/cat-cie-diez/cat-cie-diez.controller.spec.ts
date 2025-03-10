import { Test, TestingModule } from '@nestjs/testing';
import { CatCieDiezController } from './cat-cie-diez.controller';
import { CatCieDiezService } from './cat-cie-diez.service';

describe('CatCieDiezController', () => {
  let controller: CatCieDiezController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatCieDiezController],
      providers: [CatCieDiezService],
    }).compile();

    controller = module.get<CatCieDiezController>(CatCieDiezController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
