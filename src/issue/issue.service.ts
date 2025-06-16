import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
  ) {}

  async create(stationCode: string, status: boolean): Promise<Issue> {
    const issue = this.issueRepository.create({
      stationCode,
      status,
    });

    return await this.issueRepository.save(issue);
  }

  async getAllIssues(): Promise<Issue[]> {
    return this.issueRepository.find({
      where: {
        statusData: true, 
      },
      order: {
        status: 'ASC', 
        createdAt: 'DESC',
      }
    });
  }
  

  async updateStatusAndNotes(id: number, notes: string, updatedBy = 'SYSTEM'): Promise<Issue> {
    const issue = await this.issueRepository.findOne({ where: { id } });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    issue.status = false;
    issue.notes = notes;
    issue.updatedBy = updatedBy;

    return await this.issueRepository.save(issue);
  }
}
