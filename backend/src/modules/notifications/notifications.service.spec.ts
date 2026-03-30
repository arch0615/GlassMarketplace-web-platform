import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let configService: Record<string, jest.Mock>;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Return empty SMTP values so transporter stays null (log-only mode)
    configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
        const values: Record<string, any> = {
          SMTP_HOST: undefined,
          SMTP_PORT: 587,
          SMTP_USER: undefined,
          SMTP_PASS: undefined,
          SMTP_FROM: 'no-reply@lensia.pro',
        };
        if (key in values) return values[key];
        return defaultValue ?? undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    // Spy on the Logger to verify log calls instead of actual email sending
    logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('sendEmail', () => {
    it('should log the email instead of sending when SMTP is not configured', async () => {
      await service.sendEmail('user@example.com', 'Test Subject', '<p>Hello</p>');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('user@example.com'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test Subject'),
      );
      // Should also log the body since transporter is null
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('<p>Hello</p>'),
      );
    });

    it('should not throw when SMTP is not configured', async () => {
      await expect(
        service.sendEmail('user@example.com', 'Subject', 'Body'),
      ).resolves.toBeUndefined();
    });
  });

  describe('notifyOrderStatus', () => {
    it('should send an email with the correct status label', async () => {
      const order = {
        id: 'abcdef12-3456-7890-abcd-ef1234567890',
        client: { email: 'client@test.com', fullName: 'Maria' },
      };

      await service.notifyOrderStatus(order, 'delivered');

      // Should log with the client email
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('client@test.com'),
      );
      // Should contain the Spanish label for 'delivered'
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Entregado'),
      );
    });

    it('should use raw status when no label mapping exists', async () => {
      const order = {
        id: 'abcdef12-0000-0000-0000-000000000000',
        client: { email: 'client@test.com', fullName: 'Test' },
      };

      await service.notifyOrderStatus(order, 'some_custom_status');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('some_custom_status'),
      );
    });
  });

  describe('notifyOpticaNewRequest', () => {
    it('should send a notification email to the optica with the request ID', async () => {
      await service.notifyOpticaNewRequest(
        'optica@test.com',
        'req12345-6789-abcd-ef01-234567890abc',
      );

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('optica@test.com'),
      );
      // Body should contain truncated request ID
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('req12345'),
      );
    });
  });
});
