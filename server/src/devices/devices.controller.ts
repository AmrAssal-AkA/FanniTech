import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { DevicesService } from './devices.service.js';
import {
  CreateDeviceDtoSchema,
  type CreateDeviceDtoType,
} from './dto/device.dto.js';
import {
  CreateDeviceRequest,
  DeviceResponse,
} from '../swagger/swagger.schemas.js';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller('api/v1/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new device for the authenticated customer',
  })
  @ApiBody({ type: CreateDeviceRequest })
  @ApiCreatedResponse({
    description: 'Device registered successfully',
    type: DeviceResponse,
  })
  async createDevice(
    @CurrentUser('sub') customerId: string,
    @Body(new ZodValidationPipe(CreateDeviceDtoSchema))
    dto: CreateDeviceDtoType,
  ) {
    const device = await this.devicesService.createDevice(customerId, dto);
    return { data: device };
  }

  @Get()
  @ApiOperation({
    summary: 'List all devices registered by the authenticated customer',
  })
  @ApiOkResponse({
    description: 'List of devices owned by customer',
    type: [DeviceResponse],
  })
  async getCustomerDevices(@CurrentUser('sub') customerId: string) {
    const devices = await this.devicesService.getCustomerDevices(customerId);
    return { data: devices };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific device' })
  @ApiOkResponse({
    description: 'Device details',
    type: DeviceResponse,
  })
  @ApiNotFoundResponse({ description: 'Device not found' })
  @ApiForbiddenResponse({ description: 'You do not own this device' })
  async getDeviceById(
    @CurrentUser('sub') customerId: string,
    @Param('id') deviceId: string,
  ) {
    const device = await this.devicesService.getDeviceById(
      customerId,
      deviceId,
    );
    return { data: device };
  }
}
