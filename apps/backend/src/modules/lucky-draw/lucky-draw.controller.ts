import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { LuckyDrawService } from './lucky-draw.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('lucky-draw')
export class LuckyDrawController {
  constructor(private readonly luckyDrawService: LuckyDrawService) {}

  @Get('active/:projectId')
  async getActiveLuckyDraws(@Param('projectId') projectId: string) {
    const draws = await this.luckyDrawService.getActiveLuckyDraws(projectId);
    return { success: true, data: draws };
  }

  @Get(':id')
  async getLuckyDraw(@Param('id') id: string) {
    const draw = await this.luckyDrawService.getLuckyDraw(id);
    return { success: true, data: draw };
  }

  @Get(':id/my-entries')
  @UseGuards(JwtAuthGuard)
  async getMyEntries(@Param('id') luckyDrawId: string, @CurrentUser() user: any) {
    const entries = await this.luckyDrawService.getMemberEntries(luckyDrawId, user.memberId);
    return { success: true, data: entries };
  }

  @Post(':id/draw')
  @UseGuards(JwtAuthGuard)
  async executeDraw(@Param('id') luckyDrawId: string, @CurrentUser() user: any) {
    const result = await this.luckyDrawService.executeDraw(luckyDrawId, user.memberId);
    return { success: true, data: result };
  }

  @Put('entries/:entryId/claim')
  @UseGuards(JwtAuthGuard)
  async claimPrize(
    @Param('entryId') entryId: string,
    @Body() body: { name?: string; phone?: string; address?: string },
    @CurrentUser() user: any,
  ) {
    const entry = await this.luckyDrawService.claimPrize(entryId, user.memberId, body);
    return { success: true, data: entry };
  }

  @Get('my/winnings')
  @UseGuards(JwtAuthGuard)
  async getMyWinnings(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.luckyDrawService.getMemberWinnings(user.memberId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
    return { success: true, data: result };
  }
}
