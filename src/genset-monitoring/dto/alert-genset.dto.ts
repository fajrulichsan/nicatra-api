// dto/alert-genset-status.dto.ts
import { IsNotEmpty } from 'class-validator';

export class AlertGensetStatusDto {
  @IsNotEmpty()
  gensetId: string;

  @IsNotEmpty()
  voltage: number;

  @IsNotEmpty()
  current: number;

  @IsNotEmpty()
  power: number;
}
