import { Controller, Get, Inject, Query } from "@nestjs/common";

import { SearchQueryDto } from "./dto/search-query.dto";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  private readonly searchService: SearchService;

  constructor(@Inject(SearchService) searchService: SearchService) {
    this.searchService = searchService;
  }

  @Get()
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
