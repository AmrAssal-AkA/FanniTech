import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  UpdateTechnicianNotesDtoSchema,
  type UpdateTechnicianNotesDtoType,
} from './dto/technician-dashboard.dto.js';
import { TechnicianDashboardService } from './technician-dashboard.service.js';

@ApiTags('Technician Dashboard')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles('TECHNICIAN')
@Controller('api/v1/technician/dashboard')
export class TechnicianDashboardController {
  constructor(
    private readonly technicianDashboardService: TechnicianDashboardService,
  ) {}

  @ApiOperation({
    summary: 'Get workbench telemetry and assigned tickets for the logged-in technician',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Workbench data retrieved successfully.',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: Technician access only.',
  })
  @Get('workbench')
  @HttpCode(HttpStatus.OK)
  async getWorkbench(@CurrentUser() user: RequestUser) {
    return this.technicianDashboardService.workBench(user.sub);
  }

  @ApiOperation({
    summary: 'Update in-flight diagnosis or repair notes for an assigned ticket',
  })
  @ApiParam({ name: 'id', description: 'Repair ticket UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        diagnosis: { type: 'string', example: 'Short circuit on 19V power rail.' },
        repairNotes: { type: 'string', example: 'Replaced MOSFET PQ301.' },
        notes: { type: 'string', example: 'Waiting on thermal pad delivery.' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket notes updated successfully.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticket not found.' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Ticket is not assigned to this technician.',
  })
  @ApiConsumes('application/json')
  @Patch('tickets/:id/notes')
  @HttpCode(HttpStatus.OK)
  async updateTicketNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(UpdateTechnicianNotesDtoSchema))
    dto: UpdateTechnicianNotesDtoType,
  ) {
    return this.technicianDashboardService.updateTicketNotes(id, user.sub, dto);
  }
}
