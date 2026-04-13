import { Injectable } from '@nestjs/common';

import { serializeObject } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(filters: SearchQueryDto) {
    const city = filters.city?.trim() || undefined;
    const { type, minPrice, maxPrice, guests } = filters;
    const needsVariantFilter =
      typeof minPrice === 'number' || typeof maxPrice === 'number' || typeof guests === 'number';

    const results = await this.prisma.accommodationObject.findMany({
      where: {
        ...(city
          ? {
              city: {
                contains: city,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(type ? { type } : {}),
        ...(needsVariantFilter
          ? {
              variants: {
                some: {
                  ...(typeof minPrice === 'number' ? { pricePerNight: { gte: minPrice } } : {}),
                  ...(typeof maxPrice === 'number' ? { pricePerNight: { lte: maxPrice } } : {}),
                  ...(typeof guests === 'number' ? { guests: { gte: guests } } : {}),
                  isActive: true,
                },
              },
            }
          : {}),
      },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        variants: {
          where: needsVariantFilter
            ? {
                ...(typeof minPrice === 'number' ? { pricePerNight: { gte: minPrice } } : {}),
                ...(typeof maxPrice === 'number' ? { pricePerNight: { lte: maxPrice } } : {}),
                ...(typeof guests === 'number' ? { guests: { gte: guests } } : {}),
                isActive: true,
              }
            : undefined,
          orderBy: {
            pricePerNight: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      filters: {
        city,
        type,
        minPrice,
        maxPrice,
        guests,
      },
      count: results.length,
      data: results.map(serializeObject),
    };
  }
}
