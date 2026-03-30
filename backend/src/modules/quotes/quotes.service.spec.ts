import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from './quote.entity';
import { QuoteFrame } from './quote-frame.entity';
import { QuoteRequest } from '../requests/quote-request.entity';
import { RequestOptica } from '../requests/request-optica.entity';
import { OpticasService } from '../opticas/opticas.service';
import { CatalogService } from '../catalog/catalog.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

describe('QuotesService', () => {
  let service: QuotesService;
  let quotesRepo: jest.Mocked<Partial<Repository<Quote>>>;
  let quoteFramesRepo: jest.Mocked<Partial<Repository<QuoteFrame>>>;
  let requestsRepo: jest.Mocked<Partial<Repository<QuoteRequest>>>;
  let requestOpticaRepo: jest.Mocked<Partial<Repository<RequestOptica>>>;
  let opticasService: Record<string, jest.Mock>;
  let catalogService: Record<string, jest.Mock>;

  beforeEach(async () => {
    quotesRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    };

    quoteFramesRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    requestsRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    requestOpticaRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      }),
    };

    opticasService = {
      findById: jest.fn(),
    };

    catalogService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: getRepositoryToken(Quote), useValue: quotesRepo },
        { provide: getRepositoryToken(QuoteFrame), useValue: quoteFramesRepo },
        { provide: getRepositoryToken(QuoteRequest), useValue: requestsRepo },
        { provide: getRepositoryToken(RequestOptica), useValue: requestOpticaRepo },
        { provide: OpticasService, useValue: opticasService },
        { provide: CatalogService, useValue: catalogService },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a quote successfully', async () => {
      const mockRequest: Partial<QuoteRequest> = {
        id: 'req-1',
        status: 'open',
        quotesReceived: 0,
      };
      const mockOptica = { id: 'optica-1', name: 'Test Optica' };
      const savedQuote: Partial<Quote> = {
        id: 'quote-1',
        totalPrice: 500,
        status: 'pending',
        request: mockRequest as QuoteRequest,
        optica: mockOptica as any,
      };

      requestsRepo.findOne!.mockResolvedValue(mockRequest as QuoteRequest);
      opticasService.findById.mockResolvedValue(mockOptica);
      quotesRepo.create!.mockReturnValue(savedQuote as Quote);
      quotesRepo.save!.mockResolvedValue(savedQuote as Quote);
      quotesRepo.findOne!.mockResolvedValue(savedQuote as Quote);
      requestsRepo.update!.mockResolvedValue({} as any);

      const dto: CreateQuoteDto = {
        requestId: 'req-1',
        opticaId: 'optica-1',
        totalPrice: 500,
        lensDescription: 'Progressive lenses',
        estimatedDays: '5',
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(quotesRepo.create).toHaveBeenCalled();
      expect(quotesRepo.save).toHaveBeenCalled();
      expect(requestsRepo.update).toHaveBeenCalledWith('req-1', { quotesReceived: 1 });
    });

    it('should throw NotFoundException if request does not exist', async () => {
      requestsRepo.findOne!.mockResolvedValue(null);

      const dto: CreateQuoteDto = {
        requestId: 'nonexistent',
        opticaId: 'optica-1',
        totalPrice: 500,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if request is not open', async () => {
      const mockRequest: Partial<QuoteRequest> = {
        id: 'req-1',
        status: 'expired',
      };
      requestsRepo.findOne!.mockResolvedValue(mockRequest as QuoteRequest);

      const dto: CreateQuoteDto = {
        requestId: 'req-1',
        opticaId: 'optica-1',
        totalPrice: 500,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('accept', () => {
    it('should accept a pending quote and reject others', async () => {
      const mockQuote: Partial<Quote> = {
        id: 'quote-1',
        status: 'pending',
        request: { id: 'req-1', status: 'open', client: { id: 'client-1' } } as any,
      };

      quotesRepo.findOne!.mockResolvedValue(mockQuote as Quote);
      quotesRepo.update!.mockResolvedValue({} as any);
      requestsRepo.update!.mockResolvedValue({} as any);

      const result = await service.accept('quote-1', 'client-1');

      expect(quotesRepo.update).toHaveBeenCalledWith('quote-1', { status: 'accepted' });
      expect(requestsRepo.update).toHaveBeenCalledWith('req-1', { status: 'filled' });
    });

    it('should throw if request has expired when accepting a quote', async () => {
      const mockQuote: Partial<Quote> = {
        id: 'quote-1',
        status: 'pending',
        request: { id: 'req-1', status: 'expired', client: { id: 'client-1' } } as any,
      };

      quotesRepo.findOne!.mockResolvedValue(mockQuote as Quote);

      await expect(service.accept('quote-1', 'client-1')).rejects.toThrow(
        'This quote request has expired',
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending quote', async () => {
      const mockQuote: Partial<Quote> = {
        id: 'quote-1',
        status: 'pending',
        request: { id: 'req-1', client: { id: 'client-1' } } as any,
      };

      quotesRepo.findOne!.mockResolvedValue(mockQuote as Quote);
      quotesRepo.update!.mockResolvedValue({} as any);

      const result = await service.reject('quote-1', 'client-1');

      expect(quotesRepo.update).toHaveBeenCalledWith('quote-1', { status: 'rejected' });
    });

    it('should throw if quote is not pending', async () => {
      const mockQuote: Partial<Quote> = {
        id: 'quote-1',
        status: 'accepted',
        request: { id: 'req-1', client: { id: 'client-1' } } as any,
      };

      quotesRepo.findOne!.mockResolvedValue(mockQuote as Quote);

      await expect(service.reject('quote-1', 'client-1')).rejects.toThrow(BadRequestException);
    });
  });
});
