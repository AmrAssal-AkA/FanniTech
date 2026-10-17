import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AuthenticationGuard } from '../../../authentication/authentication.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import {
  CreateTechnicianRequest,
  TechnicianResponse,
} from '../../../swagger/swagger.schemas.js';
import {
  createTechnicianAccountSchema,
  type CreateTechnicianAccountDto,
} from '../../dto/create-Technician-account.dto.js';
import {
  type TechnicianListQueryDto,
  TechnicianListQuerySchema,
} from '../../dto/technician-list-query.dto.js';
import {
  resetTechnicianPasswordSchema,
  transferTechnicianTicketsSchema,
  updateTechnicianSchema,
  type ResetTechnicianPasswordDto,
  type TransferTechnicianTicketsDto,
  type UpdateTechnicianDto,
} from '../../dto/update-technician.dto.js';
import { TechniciansService } from '../../services/technicians/technicians.service.js';

@ApiTags('Admin - Technicians')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/v1/admin/technicians')
export class TechnicianController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post('/create-technician')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a technician account for Admin' })
  @ApiBody({ type: CreateTechnicianRequest })
  @ApiCreatedResponse({
    description: 'Technician account created successfully',
    type: TechnicianResponse,
  })
  @ApiBadRequestResponse({ description: 'The request body failed validation' })
  @ApiConflictResponse({ description: 'A technician with this email already exists' })
  @ApiInternalServerErrorResponse({ description: 'The technician account could not be created' })
  createTechnician(
    @Body(new ZodValidationPipe(createTechnicianAccountSchema))
    data: CreateTechnicianAccountDto,
  ) {
    return this.techniciansService.createTechnicianAccount(data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List technicians with pagination and search for Admin' })
  @ApiOkResponse({ description: 'Technicians list retrieved successfully' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  listTechnicians(
    @Query(new ZodValidationPipe(TechnicianListQuerySchema))
    query: TechnicianListQueryDto,
  ) {
    return this.techniciansService.listTechnicians(query);
  }

  @Get('getAllTechnicians')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all technicians for Admin (legacy/unpaginated)' })
  @ApiOkResponse({
    description: 'Technicians retrieved successfully',
    type: [TechnicianResponse],
  })
  @ApiNotFoundResponse({ description: 'No technicians found' })
  @ApiInternalServerErrorResponse({ description: 'The technicians could not be retrieved' })
  getAllTechnicians() {
    return this.techniciansService.getAllTechnicians();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get technician profile, workload, and repair tickets by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Technician details retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Technician not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  getTechnicianById(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.getTechnicianById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update technician profile details (name, phone, email)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Technician updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @ApiNotFoundResponse({ description: 'Technician not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  updateTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTechnicianSchema))
    data: UpdateTechnicianDto,
  ) {
    return this.techniciansService.updateTechnician(id, data);
  }

  @Patch(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset technician password by Admin' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Password validation failed' })
  @ApiNotFoundResponse({ description: 'Technician not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(resetTechnicianPasswordSchema))
    data: ResetTechnicianPasswordDto,
  ) {
    return this.techniciansService.resetTechnicianPassword(id, data.password);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete technician account' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Technician deleted successfully' })
  @ApiBadRequestResponse({ description: 'Cannot delete technician with active repair tickets' })
  @ApiNotFoundResponse({ description: 'Technician not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  deleteTechnician(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.deleteTechnician(id);
  }

  @Post(':id/transfer-tickets')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer all active tickets from one technician to another' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Source technician ID' })
  @ApiOkResponse({ description: 'Active tickets transferred successfully' })
  @ApiBadRequestResponse({ description: 'Invalid technician IDs' })
  @ApiNotFoundResponse({ description: 'Technician not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  transferTickets(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(transferTechnicianTicketsSchema))
    data: TransferTechnicianTicketsDto,
  ) {
    return this.techniciansService.transferTickets(id, data.targetTechnicianId);
  }
}
