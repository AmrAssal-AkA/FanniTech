import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { RepairRequestsService } from './repair-requests.service.js';
import {
  CreateRepairRequestDtoSchema,
  type CreateRepairRequestDtoType,
} from './dto/create-repair-request.dto.js';
import {
  RepairRequestQueryDtoSchema,
  type RepairRequestQueryDtoType,
} from './dto/repair-request-query.dto.js';
import {
  CreateRepairRequestMultipart,
  RepairRequestResponse,
} from '../swagger/swagger.schemas.js';

@ApiTags('Repair Requests')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller('api/v1/repair-requests')
export class RepairRequestsController {
  constructor(private readonly repairRequestsService: RepairRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new repair request with optional photos' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateRepairRequestMultipart })
  @ApiCreatedResponse({
    description: 'Repair request submitted successfully',
    type: RepairRequestResponse,
  })
  @ApiNotFoundResponse({ description: 'Device not found' })
  @ApiForbiddenResponse({ description: 'You do not own this device' })
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async submitRepairRequest(
    @CurrentUser('sub') customerId: string,
    @Body(new ZodValidationPipe(CreateRepairRequestDtoSchema))
    dto: CreateRepairRequestDtoType,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const request = await this.repairRequestsService.submitRequest(
      customerId,
      dto,
      files ?? [],
    );
    return { data: request };
  }

  @Get()
  @ApiOperation({ summary: 'List customer repair requests with pagination' })
  @ApiOkResponse({
    description: 'Paginated list of customer repair requests',
  })
  async listCustomerRequests(
    @CurrentUser('sub') customerId: string,
    @Query(new ZodValidationPipe(RepairRequestQueryDtoSchema))
    query: RepairRequestQueryDtoType,
  ) {
    const result = await this.repairRequestsService.listCustomerRequests(
      customerId,
      query,
    );
    return { data: result.items, pagination: result.pagination };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a repair request' })
  @ApiOkResponse({
    description: 'Repair request details with media images',
    type: RepairRequestResponse,
  })
  @ApiNotFoundResponse({ description: 'Repair request not found' })
  @ApiForbiddenResponse({
    description: 'You do not have access to this repair request',
  })
  async getRequestDetails(
    @CurrentUser('sub') customerId: string,
    @Param('id') id: string,
  ) {
    const request = await this.repairRequestsService.getRequestDetails(
      customerId,
      id,
    );
    return { data: request };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending repair request' })
  @ApiOkResponse({
    description: 'Repair request cancelled successfully',
    type: RepairRequestResponse,
  })
  @ApiNotFoundResponse({ description: 'Repair request not found' })
  @ApiForbiddenResponse({
    description: 'You do not have access to this repair request',
  })
  async cancelRequest(
    @CurrentUser('sub') customerId: string,
    @Param('id') id: string,
  ) {
    const request = await this.repairRequestsService.cancelRequest(
      customerId,
      id,
    );
    return { data: request };
  }
}
