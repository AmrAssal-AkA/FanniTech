import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../authentication/authentication.guard.js';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { RepairRequestManagmentService } from './repair-request-managment.service.js';
import {
  AcceptRepairRequestDtoSchema,
  AssignTechnicianDtoSchema,
  UnassignTechnicianDtoSchema,
  ListRepairRequestsQueryDtoSchema,
  ListTicketsQueryDtoSchema,
  MarkReadyForPickupDtoSchema,
  MarkUnrepairableDtoSchema,
  RejectRepairRequestDtoSchema,
  StartDiagnosisDtoSchema,
  StartRepairDtoSchema,
  UpdateTicketStatusDtoSchema,
  type AcceptRepairRequestDtoType,
  type AssignTechnicianDtoType,
  type UnassignTechnicianDtoType,
  type ListRepairRequestsQueryDtoType,
  type ListTicketsQueryDtoType,
  type MarkReadyForPickupDtoType,
  type MarkUnrepairableDtoType,
  type RejectRepairRequestDtoType,
  type StartDiagnosisDtoType,
  type StartRepairDtoType,
  type UpdateTicketStatusDtoType,
} from './dto/repair-request-management.dto.js';

@ApiTags('Repair Request Management')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Controller('api/v1/repair-request-management')
export class RepairRequestManagmentController {
  constructor(private readonly service: RepairRequestManagmentService) {}
  
  @ApiOperation({ summary: 'List repair requests with optional filters For Admin' })
  @ApiConsumes('application/json')
  @Get('requests') @Roles('ADMIN') listRequests(
    @Query(new ZodValidationPipe(ListRepairRequestsQueryDtoSchema))
    q: ListRepairRequestsQueryDtoType,
  ) {
    try {
    return this.service.listRequests(q);
    } catch (error) {
      console.error('Error in listRequests:', error);
      throw error; 
    }
  }

  @ApiOperation({ summary: 'Get a specific repair request by ID' })
  @ApiConsumes('application/json')
  @Get('requests/:id') @Roles('ADMIN', 'TECHNICIAN') getRequest(
    @Param('id') id: string,
  ) {
    return this.service.getRequestById(id);
  }
  @ApiOperation({ summary: 'Accept a repair request by ID For Admin' })
  @Patch('requests/:id/accept') @Roles('ADMIN') accept(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AcceptRepairRequestDtoSchema))
    d: AcceptRepairRequestDtoType,
  ) {
    return this.service.acceptRequest(id, d);
  }
  @ApiOperation({ summary: 'Reject a repair request by ID For Admin' })
  @Patch('requests/:id/reject') @Roles('ADMIN') reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RejectRepairRequestDtoSchema))
    d: RejectRepairRequestDtoType,
  ) {
    return this.service.rejectRequest(id, d);
  }
  @ApiOperation({ summary: 'List tickets with optional filters For Admin and Technician' })
  @Get('tickets') @Roles('ADMIN', 'TECHNICIAN') listTickets(
    @Query(new ZodValidationPipe(ListTicketsQueryDtoSchema))
    q: ListTicketsQueryDtoType,
    @CurrentUser() u: RequestUser,
  ) {
    return this.service.listTickets(q, u);
  }
  @ApiOperation({ summary: 'Get a specific ticket by ID For Admin and Technician' })
  @Get('tickets/:id') @Roles('ADMIN', 'TECHNICIAN') getTicket(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
  ) {
    return this.service.getTicketById(id, u);
  }
  @ApiOperation({ summary: 'Get the history of a specific ticket by ID For Admin and Technician' })
  @Get('tickets/:id/history') @Roles('ADMIN', 'TECHNICIAN') history(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
  ) {
    return this.service.getTicketHistory(id, u);
  }
  @ApiOperation({ summary: 'Assign a technician to a ticket For Admin' })
  @Patch('tickets/:id/assign-technician') @Roles('ADMIN') assign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignTechnicianDtoSchema))
    d: AssignTechnicianDtoType,
  ) {
    return this.service.assignTechnician(id, d);
  }

  @ApiOperation({ summary: 'Unassign a technician from a ticket For Admin' })
  @Patch('tickets/:id/unassign-technician') @Roles('ADMIN') unassign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UnassignTechnicianDtoSchema))
    d: UnassignTechnicianDtoType,
  ) {
    return this.service.unassignTechnician(id, d.notes);
  }
  @ApiOperation({ summary: 'Diagnose a ticket For Admin and Technician' }) 
  @Patch('tickets/:id/diagnose') @Roles('ADMIN', 'TECHNICIAN') diagnose(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
    @Body(new ZodValidationPipe(StartDiagnosisDtoSchema))
    d: StartDiagnosisDtoType,
  ) {
    return this.service.startDiagnosis(id, u, d);
  }
  @ApiOperation({ summary: 'Start repair on a ticket For Admin and Technician' })
  @Patch('tickets/:id/repair') @Roles('ADMIN', 'TECHNICIAN') repair(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
    @Body(new ZodValidationPipe(StartRepairDtoSchema)) d: StartRepairDtoType,
  ) {
    return this.service.startRepair(id, u, d);
  }
  @ApiOperation({ summary: 'Mark a ticket as ready for pickup For Admin and Technician' })
  @Patch('tickets/:id/ready-for-pickup') @Roles('ADMIN', 'TECHNICIAN') ready(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
    @Body(new ZodValidationPipe(MarkReadyForPickupDtoSchema))
    d: MarkReadyForPickupDtoType,
  ) {
    return this.service.markReadyForPickup(id, u, d);
  }
  @ApiOperation({ summary: 'Complete a ticket For Admin and Technician' })
  @Patch('tickets/:id/complete')
  @Roles('ADMIN', 'TECHNICIAN')
  @HttpCode(200)
  complete(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
    @Body(new ZodValidationPipe(UpdateTicketStatusDtoSchema))
    d: UpdateTicketStatusDtoType,
  ) {
    return this.service.completeTicket(id, u, d);
  }
  @ApiOperation({ summary: 'Mark a ticket as unrepairable For Admin and Technician' })
  @Patch('tickets/:id/unrepairable') @Roles('ADMIN', 'TECHNICIAN') unrepairable(
    @Param('id') id: string,
    @CurrentUser() u: RequestUser,
    @Body(new ZodValidationPipe(MarkUnrepairableDtoSchema))
    d: MarkUnrepairableDtoType,
  ) {
    return this.service.markUnrepairable(id, u, d);
  }
  @ApiOperation({ summary: 'Cancel a ticket For Admin' })
  @Patch('tickets/:id/cancel') @Roles('ADMIN') cancel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTicketStatusDtoSchema))
    d: UpdateTicketStatusDtoType,
  ) {
    return this.service.cancelTicket(id, d);
  }
}
