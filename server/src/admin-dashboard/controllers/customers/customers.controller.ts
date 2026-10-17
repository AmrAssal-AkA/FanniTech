import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
  type CustomerListQueryDto,
  CustomerListQuerySchema,
} from '../../dto/customer-list-query.dto.js';
import { CustomersService } from '../../services/customers/customers.service.js';

@ApiTags('Admin - Customers')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/v1/admin/customers')
export class CustomersController {
  constructor(private readonly customer: CustomersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all customers with pagination and search For Admin' })
  @ApiOkResponse({ description: 'Returns all customers matching search and pagination' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getAllCustomers(
    @Query(new ZodValidationPipe(CustomerListQuerySchema)) query: CustomerListQueryDto,
  ) {
    return await this.customer.getAllCustomers(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get customer profile and repair history by ID For Admin' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Customer User UUID' })
  @ApiOkResponse({ description: 'Returns customer details, owned devices, and repair history' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getCustomerById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.customer.getCustomerById(id);
  }
}

