import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { FeedbackStatus, FeedbackCategory, FeedbackMessageRole } from '@prisma/client';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);
  private readonly glmApiKey: string;
  private readonly glmApiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  private readonly glmModel = 'glm-4-flash';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.glmApiKey = this.configService.get<string>('GLM_API_KEY') || 'fdafdd21075f48498ee4161bf7deae37.OuhQom6Guirxg4q5';
  }

  /**
   * Create a new feedback/conversation session
   */
  async createFeedback(data: {
    projectId: string;
    memberId?: string;
    category?: FeedbackCategory;
    title?: string;
    isAnonymous?: boolean;
    contactInfo?: { name?: string; phone?: string; email?: string };
  }) {
    const feedback = await this.prisma.feedback.create({
      data: {
        projectId: data.projectId,
        memberId: data.memberId || null,
        category: data.category || FeedbackCategory.GENERAL,
        title: data.title,
        isAnonymous: data.isAnonymous || !data.memberId,
        contactInfo: data.contactInfo ? data.contactInfo : undefined,
        status: FeedbackStatus.OPEN,
      },
    });

    this.logger.log(`Feedback created: ${feedback.id}`);
    return feedback;
  }

  /**
   * Get feedback by ID with messages
   */
  async getFeedback(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  /**
   * Get member's feedback history
   */
  async getMemberFeedbacks(memberId: string, params?: {
    status?: FeedbackStatus;
    page?: number;
    pageSize?: number;
  }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { memberId };
    if (params?.status) {
      where.status = params.status;
    }

    const [feedbacks, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return {
      items: feedbacks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Send a message in the feedback conversation
   * This is the main AI chat endpoint
   */
  async sendMessage(feedbackId: string, content: string, memberId?: string) {
    // Get feedback and verify access
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Get last 20 messages for context
        },
        project: {
          include: {
            merchants: {
              where: { status: 'ACTIVE' },
              take: 50,
              select: {
                name: true,
                category: true,
                floor: true,
                unit: true,
                openingHours: true,
                phone: true,
              },
            },
            venues: {
              take: 5,
              select: {
                name: true,
                address: true,
                openingHours: true,
                transportation: true,
                facilities: true,
              },
            },
            serviceDirectories: {
              take: 20,
              select: {
                name: true,
                category: true,
                location: true,
                phone: true,
                operatingHours: true,
              },
            },
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Save user message
    const userMessage = await this.prisma.feedbackMessage.create({
      data: {
        feedbackId,
        role: FeedbackMessageRole.USER,
        content,
      },
    });

    // Build context for AI
    const mallInfo = this.buildMallContext(feedback.project);
    const systemPrompt = this.buildSystemPrompt(mallInfo, feedback.category);

    // Build conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add previous messages
    for (const msg of feedback.messages) {
      messages.push({
        role: msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'assistant' : 'system',
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({ role: 'user', content });

    // Call GLM4 API
    let aiResponse: string;
    let tokens = 0;

    try {
      const glmResult = await this.callGLM(messages);
      aiResponse = glmResult.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。请稍后再试。';
      tokens = glmResult.usage?.total_tokens || 0;
    } catch (error) {
      this.logger.error('GLM API error:', error);
      aiResponse = '抱歉，系统暂时繁忙，请稍后再试。如果您有紧急问题，请联系商场客服中心。';
    }

    // Save AI response
    const assistantMessage = await this.prisma.feedbackMessage.create({
      data: {
        feedbackId,
        role: FeedbackMessageRole.ASSISTANT,
        content: aiResponse,
        aiModel: this.glmModel,
        tokens,
      },
    });

    // Update feedback title if first message
    if (feedback.messages.length === 0 && !feedback.title) {
      const title = content.substring(0, 100) + (content.length > 100 ? '...' : '');
      await this.prisma.feedback.update({
        where: { id: feedbackId },
        data: { title, status: FeedbackStatus.IN_PROGRESS },
      });
    }

    return {
      userMessage,
      assistantMessage,
    };
  }

  /**
   * Build system prompt with mall context
   */
  private buildSystemPrompt(mallInfo: string, category: FeedbackCategory): string {
    const categoryContext = {
      [FeedbackCategory.GENERAL]: '您是一位专业、友好的商场客服助手',
      [FeedbackCategory.COMPLAINT]: '您是一位善于倾听和解决问题的商场客服助手，对顾客的投诉表示理解和歉意',
      [FeedbackCategory.SUGGESTION]: '您是一位积极收集顾客建议的商场客服助手，对建议表示感谢',
      [FeedbackCategory.INQUIRY]: '您是一位知识丰富的商场客服助手，能够回答各种关于商场的问题',
      [FeedbackCategory.PRAISE]: '您是一位热情的商场客服助手，对顾客的表扬表示感谢',
      [FeedbackCategory.OTHER]: '您是一位专业的商场客服助手',
    };

    return `${categoryContext[category] || categoryContext[FeedbackCategory.GENERAL]}。

您可以帮助顾客：
1. 查询商场信息（营业时间、地址、交通指引等）
2. 查找商户位置和信息
3. 了解商场服务设施
4. 记录顾客的反馈意见
5. 回答关于会员积分/印花的问题

商场信息：
${mallInfo}

请注意：
- 使用礼貌、专业的语言
- 如果无法回答问题，建议顾客联系商场客服中心
- 对于投诉，表示理解并承诺会记录反馈
- 回答要简洁明了，使用中文回复`;
  }

  /**
   * Build mall context from project data
   */
  private buildMallContext(project: any): string {
    const sections: string[] = [];

    // Mall basic info
    if (project.name) {
      const name = typeof project.name === 'object'
        ? (project.name['zh-TW'] || project.name['zh-CN'] || project.name['en'] || JSON.stringify(project.name))
        : project.name;
      sections.push(`商场名称：${name}`);
    }

    // Venue info
    if (project.venues && project.venues.length > 0) {
      const venue = project.venues[0];
      if (venue.address) {
        const addr = typeof venue.address === 'object'
          ? (venue.address['zh-TW'] || venue.address['zh-CN'] || venue.address['en'] || '')
          : venue.address;
        if (addr) sections.push(`地址：${addr}`);
      }
      if (venue.openingHours) {
        const hours = typeof venue.openingHours === 'object'
          ? (venue.openingHours['zh-TW'] || venue.openingHours['zh-CN'] || JSON.stringify(venue.openingHours))
          : venue.openingHours;
        sections.push(`营业时间：${hours}`);
      }
      if (venue.transportation) {
        const transport = typeof venue.transportation === 'object'
          ? (venue.transportation['zh-TW'] || venue.transportation['zh-CN'] || JSON.stringify(venue.transportation))
          : venue.transportation;
        sections.push(`交通指引：${transport}`);
      }
    }

    // Merchants list
    if (project.merchants && project.merchants.length > 0) {
      const merchantList = project.merchants.map((m: any) => {
        const name = typeof m.name === 'object'
          ? (m.name['zh-TW'] || m.name['zh-CN'] || m.name['en'] || '')
          : m.name;
        const location = [m.floor, m.unit].filter(Boolean).join(' ');
        return `${name}${location ? ` (${location})` : ''} - ${m.category || '其他'}`;
      }).join('\n');
      sections.push(`商户列表：\n${merchantList}`);
    }

    // Service directories
    if (project.serviceDirectories && project.serviceDirectories.length > 0) {
      const services = project.serviceDirectories.map((s: any) => {
        const name = typeof s.name === 'object'
          ? (s.name['zh-TW'] || s.name['zh-CN'] || s.name['en'] || '')
          : s.name;
        const location = typeof s.location === 'object'
          ? (s.location['zh-TW'] || s.location['zh-CN'] || '')
          : s.location || '';
        return `${name}${location ? ` - ${location}` : ''}`;
      }).join('\n');
      sections.push(`服务设施：\n${services}`);
    }

    return sections.join('\n\n') || '暂无详细商场信息';
  }

  /**
   * Call GLM4 API
   */
  private async callGLM(messages: ChatMessage[]): Promise<GLMResponse> {
    const response = await fetch(this.glmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.glmApiKey}`,
      },
      body: JSON.stringify({
        model: this.glmModel,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`GLM API error: ${response.status} - ${errorText}`);
      throw new Error(`GLM API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Rate feedback
   */
  async rateFeedback(feedbackId: string, rating: number) {
    const feedback = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: { rating },
    });
    return feedback;
  }

  /**
   * Close/resolve feedback
   */
  async resolveFeedback(feedbackId: string, resolvedBy?: string) {
    const feedback = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status: FeedbackStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });
    return feedback;
  }
}
