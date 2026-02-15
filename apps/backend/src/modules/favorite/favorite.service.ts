import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class FavoriteService {
  private readonly logger = new Logger(FavoriteService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get member's favorite merchants list
   */
  async getFavorites(memberId: string, projectId?: string) {
    const favorites = await this.prisma.memberFavorite.findMany({
      where: { memberId },
      include: {
        merchant: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by project if specified
    const filtered = projectId
      ? favorites.filter(f => f.merchant.projectId === projectId)
      : favorites;

    return filtered.map(f => ({
      id: f.id,
      merchantId: f.merchantId,
      name: f.merchant.name,
      category: f.merchant.category,
      floor: f.merchant.floor,
      unit: f.merchant.unit,
      logo: f.merchant.logo,
      coverImage: f.merchant.coverImage,
      mallId: f.merchant.projectId,
      mallName: f.merchant.project.name,
      stampEnabled: f.merchant.stampEnabled,
      createdAt: f.createdAt,
    }));
  }

  /**
   * Add merchant to favorites
   */
  async addFavorite(memberId: string, merchantId: string) {
    // Check if merchant exists
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Check if already favorited
    const existing = await this.prisma.memberFavorite.findUnique({
      where: {
        memberId_merchantId: { memberId, merchantId },
      },
    });
    if (existing) {
      throw new ConflictException('Merchant already in favorites');
    }

    // Add to favorites
    const favorite = await this.prisma.memberFavorite.create({
      data: { memberId, merchantId },
      include: {
        merchant: {
          include: { project: true },
        },
      },
    });

    this.logger.log(`Member ${memberId} added merchant ${merchantId} to favorites`);

    return {
      id: favorite.id,
      merchantId: favorite.merchantId,
      name: favorite.merchant.name,
      createdAt: favorite.createdAt,
    };
  }

  /**
   * Remove merchant from favorites
   */
  async removeFavorite(memberId: string, merchantId: string) {
    const favorite = await this.prisma.memberFavorite.findUnique({
      where: {
        memberId_merchantId: { memberId, merchantId },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.memberFavorite.delete({
      where: { id: favorite.id },
    });

    this.logger.log(`Member ${memberId} removed merchant ${merchantId} from favorites`);

    return { message: 'Favorite removed successfully' };
  }

  /**
   * Check if a merchant is favorited by a member
   */
  async isFavorite(memberId: string, merchantId: string): Promise<boolean> {
    const favorite = await this.prisma.memberFavorite.findUnique({
      where: {
        memberId_merchantId: { memberId, merchantId },
      },
    });
    return !!favorite;
  }

  /**
   * Get favorites count for a member
   */
  async getFavoritesCount(memberId: string): Promise<number> {
    return this.prisma.memberFavorite.count({
      where: { memberId },
    });
  }
}
