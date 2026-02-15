import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeedbackCategory, FeedbackStatus } from '@prisma/client';

class CreateFeedbackDto {
  projectId: string;
  category?: FeedbackCategory;
  title?: string;
  isAnonymous?: boolean;
  contactInfo?: { name?: string; phone?: string; email?: string };
}

class SendMessageDto {
  content: string;
}

class RateFeedbackDto {
  rating: number; // 1-5
}

@ApiTags('AI Customer Service / Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Create new feedback conversation
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start new AI customer service conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  async createFeedback(
    @CurrentUser() user: { memberId: string },
    @Body() body: CreateFeedbackDto,
  ) {
    const feedback = await this.feedbackService.createFeedback({
      ...body,
      memberId: user.memberId,
    });
    return {
      code: 0,
      message: 'success',
      data: feedback,
    };
  }

  /**
   * Create anonymous feedback (no login required)
   */
  @Post('anonymous')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start anonymous AI conversation' })
  @ApiResponse({ status: 201, description: 'Anonymous conversation created' })
  async createAnonymousFeedback(@Body() body: CreateFeedbackDto) {
    const feedback = await this.feedbackService.createFeedback({
      ...body,
      isAnonymous: true,
    });
    return {
      code: 0,
      message: 'success',
      data: feedback,
    };
  }

  /**
   * Get member's feedback history
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my feedback history' })
  @ApiResponse({ status: 200, description: 'Feedback list' })
  async getMyFeedbacks(
    @CurrentUser() user: { memberId: string },
    @Query('status') status?: FeedbackStatus,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const result = await this.feedbackService.getMemberFeedbacks(user.memberId, {
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * Get feedback detail with messages
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get feedback conversation detail' })
  @ApiResponse({ status: 200, description: 'Feedback detail with messages' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async getFeedback(@Param('id') id: string) {
    const feedback = await this.feedbackService.getFeedback(id);
    return {
      code: 0,
      message: 'success',
      data: feedback,
    };
  }

  /**
   * Send message in conversation (AI chat)
   */
  @Post(':id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send message and get AI response' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message sent, AI response returned' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async sendMessage(
    @Param('id') feedbackId: string,
    @Body() body: SendMessageDto,
  ) {
    const result = await this.feedbackService.sendMessage(feedbackId, body.content);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * Rate feedback conversation
   */
  @Put(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rate feedback conversation' })
  @ApiBody({ type: RateFeedbackDto })
  @ApiResponse({ status: 200, description: 'Rating submitted' })
  async rateFeedback(
    @Param('id') feedbackId: string,
    @Body() body: RateFeedbackDto,
  ) {
    const feedback = await this.feedbackService.rateFeedback(feedbackId, body.rating);
    return {
      code: 0,
      message: 'Rating submitted',
      data: { rating: feedback.rating },
    };
  }

  /**
   * Close/resolve feedback
   */
  @Put(':id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Close/resolve feedback conversation' })
  @ApiResponse({ status: 200, description: 'Feedback resolved' })
  async resolveFeedback(
    @CurrentUser() user: { memberId: string },
    @Param('id') feedbackId: string,
  ) {
    const feedback = await this.feedbackService.resolveFeedback(feedbackId, user.memberId);
    return {
      code: 0,
      message: 'Feedback resolved',
      data: { status: feedback.status },
    };
  }
}
