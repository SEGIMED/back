import { Test, TestingModule } from '@nestjs/testing';
import { SubcatCieDiezService } from './subcat-cie-diez.service';

describe('SubcatCieDiezService', () => {
  let service: SubcatCieDiezService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubcatCieDiezService],
    }).compile();

    service = module.get<SubcatCieDiezService>(SubcatCieDiezService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
