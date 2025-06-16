import { Controller, Get } from '@nestjs/common';
import { IssueService } from './issue.service';

@Controller('issues')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Get()
  async getAllIssues(): Promise<any> {
    const result = await this.issueService.getAllIssues();
    return {
      message: 'Issue records fetched successfully',
      acknowledged: true,
      data: result,
    };
  }
}
