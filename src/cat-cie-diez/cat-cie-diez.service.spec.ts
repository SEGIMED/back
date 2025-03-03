import { Test, TestingModule } from '@nestjs/testing';
import { CatCieDiezService } from './cat-cie-diez.service';

describe('CatCieDiezService', () => {
  let service: CatCieDiezService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatCieDiezService],
    }).compile();

    service = module.get<CatCieDiezService>(CatCieDiezService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
