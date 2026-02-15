import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ summary: 'Get member favorites list' })
  @ApiResponse({ status: 200, description: 'List of favorite merchants' })
  async getFavorites(
    @CurrentUser() user: { memberId: string },
    @Query('projectId') projectId?: string,
  ) {
    const favorites = await this.favoriteService.getFavorites(user.memberId, projectId);
    return {
      code: 0,
      message: 'success',
      data: favorites,
    };
  }

  @Post(':merchantId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add merchant to favorites' })
  @ApiResponse({ status: 201, description: 'Merchant added to favorites' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiResponse({ status: 409, description: 'Merchant already in favorites' })
  async addFavorite(
    @CurrentUser() user: { memberId: string },
    @Param('merchantId') merchantId: string,
  ) {
    const favorite = await this.favoriteService.addFavorite(user.memberId, merchantId);
    return {
      code: 0,
      message: 'Added to favorites',
      data: favorite,
    };
  }

  @Delete(':merchantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove merchant from favorites' })
  @ApiResponse({ status: 200, description: 'Merchant removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(
    @CurrentUser() user: { memberId: string },
    @Param('merchantId') merchantId: string,
  ) {
    await this.favoriteService.removeFavorite(user.memberId, merchantId);
    return {
      code: 0,
      message: 'Removed from favorites',
    };
  }

  @Get(':merchantId/check')
  @ApiOperation({ summary: 'Check if merchant is favorited' })
  @ApiResponse({ status: 200, description: 'Favorite status' })
  async checkFavorite(
    @CurrentUser() user: { memberId: string },
    @Param('merchantId') merchantId: string,
  ) {
    const isFavorite = await this.favoriteService.isFavorite(user.memberId, merchantId);
    return {
      code: 0,
      message: 'success',
      data: { isFavorite },
    };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get favorites count' })
  @ApiResponse({ status: 200, description: 'Favorites count' })
  async getFavoritesCount(@CurrentUser() user: { memberId: string }) {
    const count = await this.favoriteService.getFavoritesCount(user.memberId);
    return {
      code: 0,
      message: 'success',
      data: { count },
    };
  }
}
