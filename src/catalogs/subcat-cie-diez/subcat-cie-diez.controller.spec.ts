import { Test, TestingModule } from '@nestjs/testing';
import { SubcatCieDiezController } from './subcat-cie-diez.controller';
import { SubcatCieDiezService } from './subcat-cie-diez.service';

describe('SubcatCieDiezController', () => {
  let controller: SubcatCieDiezController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcatCieDiezController],
      providers: [SubcatCieDiezService],
    }).compile();

    controller = module.get<SubcatCieDiezController>(SubcatCieDiezController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
