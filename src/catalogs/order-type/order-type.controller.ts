import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { OrderTypeService } from './order-type.service';
import { CreateOrderTypeDto } from './dto/create-order-type.dto';
import { UpdateOrderTypeDto } from './dto/update-order-type.dto';
import { PaginationParams } from 'src/utils/pagination.helper';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Catalogs - Order Types')
@ApiBearerAuth('access-token')
@Controller('order-type')
export class OrderTypeController {
  constructor(private readonly orderTypeService: OrderTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order type' })
  @ApiBody({ type: CreateOrderTypeDto })
  @ApiResponse({
    status: 201,
    description: 'The order type has been successfully created',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  create(@Body() createOrderTypeDto: CreateOrderTypeDto) {
    return this.orderTypeService.create(createOrderTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all order types with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Field to order by',
    type: String,
  })
  @ApiQuery({
    name: 'orderDirection',
    required: false,
    description: 'Order direction (asc or desc)',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of order types',
    type: [Object],
  })
  findAll(@Query() paginationParams: PaginationParams) {
    return this.orderTypeService.findAll(paginationParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order type by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the order type to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The order type has been found',
    type: Object,
  })
  @ApiResponse({ status: 404, description: 'Order type not found' })
  findOne(@Param('id') id: string) {
    return this.orderTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order type' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the order type to update',
    type: String,
  })
  @ApiBody({ type: UpdateOrderTypeDto })
  @ApiResponse({
    status: 200,
    description: 'The order type has been successfully updated',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @ApiResponse({ status: 404, description: 'Order type not found' })
  update(
    @Param('id') id: string,
    @Body() updateOrderTypeDto: UpdateOrderTypeDto,
  ) {
    return this.orderTypeService.update(id, updateOrderTypeDto);
  }
}
