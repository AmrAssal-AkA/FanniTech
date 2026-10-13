import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { NotificationQueryDtoSchema } from './dto/notification-query.dto.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications (paginated)' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: Record<string, string>,
  ) {
    const parsed = NotificationQueryDtoSchema.parse(query);
    return this.notificationsService.listNotifications(userId, parsed);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@CurrentUser('sub') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { data: { count } };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markRead(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
