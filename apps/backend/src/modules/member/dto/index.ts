import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsDateString,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum MemberTier {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNSPECIFIED = 'unspecified',
}

export enum IdDocumentType {
  HKID = 'hkid',
  PASSPORT = 'passport',
  OTHER = 'other',
}

// ─── Create Member DTO ──────────────────────────────────────────────────────

export class CreateMemberDto {
  @ApiProperty({ description: 'Phone number with country code', example: '+85291234567' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Full name in Traditional Chinese' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nameZhHk: string;

  @ApiPropertyOptional({ description: 'Full name in Simplified Chinese' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameZhCn?: string;

  @ApiPropertyOptional({ description: 'Full name in English' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Date of birth (ISO 8601)', example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: IdDocumentType, description: 'ID document type' })
  @IsOptional()
  @IsEnum(IdDocumentType)
  idDocumentType?: IdDocumentType;

  @ApiPropertyOptional({ description: 'ID document number (encrypted at rest)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  idDocumentNumber?: string;

  @ApiPropertyOptional({ description: 'District/area of residence' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Preferred language', example: 'zh-HK' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ description: 'Marketing opt-in consent' })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ApiPropertyOptional({ description: 'Project ID for registration context' })
  @IsOptional()
  @IsString()
  projectId?: string;
}

// ─── Update Member DTO ──────────────────────────────────────────────────────

export class UpdateMemberDto {
  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Full name in Traditional Chinese' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameZhHk?: string;

  @ApiPropertyOptional({ description: 'Full name in Simplified Chinese' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameZhCn?: string;

  @ApiPropertyOptional({ description: 'Full name in English' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Date of birth (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'District/area of residence' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Preferred language' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiPropertyOptional({ description: 'Marketing opt-in consent' })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

// ─── Search Members DTO ─────────────────────────────────────────────────────

export class SearchMembersDto {
  @ApiPropertyOptional({ description: 'Search keyword (name, phone, email, member ID)' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ enum: MemberTier, description: 'Filter by tier' })
  @IsOptional()
  @IsEnum(MemberTier)
  tier?: MemberTier;

  @ApiPropertyOptional({ enum: MemberStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ description: 'Filter by project ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Registration date from (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  registeredFrom?: string;

  @ApiPropertyOptional({ description: 'Registration date to (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  registeredTo?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Sort field', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// ─── Counter Registration DTO ───────────────────────────────────────────────

export class CounterRegistrationDto {
  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Name in Traditional Chinese' })
  @IsString()
  nameZhHk: string;

  @ApiPropertyOptional({ description: 'Name in English' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Project ID where counter registration occurred' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'Operator notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// ─── Tier Change DTO ────────────────────────────────────────────────────────

export class TierChangeDto {
  @ApiProperty({ description: 'Member ID' })
  @IsString()
  memberId: string;

  @ApiProperty({ enum: MemberTier, description: 'New tier' })
  @IsEnum(MemberTier)
  newTier: MemberTier;

  @ApiProperty({ description: 'Reason for tier change' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Effective date (ISO 8601). Defaults to now.' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;
}

// ─── Special List Entry DTO ─────────────────────────────────────────────────

export class SpecialListEntryDto {
  @ApiProperty({ description: 'Member ID' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'List type', enum: ['whitelist', 'blacklist', 'vip', 'watch'] })
  @IsString()
  listType: string;

  @ApiProperty({ description: 'Reason for adding to list' })
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: 'Expiry date (ISO 8601). Null for permanent.' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

// ─── Import Members DTO ─────────────────────────────────────────────────────

export class ImportMembersDto {
  @ApiProperty({ description: 'File URL (CSV/Excel from storage)' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'Target project ID' })
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ description: 'Skip duplicate phone numbers', default: true })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;
}
