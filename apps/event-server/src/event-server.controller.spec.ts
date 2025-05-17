import { Test, TestingModule } from '@nestjs/testing';
import { EventServerController } from './event-server.controller';
import { EventServerService } from './event-server.service';

describe('EventServerController', () => {
  let eventServerController: EventServerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventServerController],
      providers: [EventServerService],
    }).compile();

    eventServerController = app.get<EventServerController>(EventServerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eventServerController.getHello()).toBe('Hello World!');
    });
  });
});
