import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateGensetMonitoringDto {
  @IsString()
  @IsNotEmpty({ message: 'gensetId tidak boleh kosong' })
  gensetId: string;

  @IsNumber({}, { message: 'voltage harus berupa angka' })
  @IsNotEmpty({ message: 'voltage tidak boleh kosong' })
  voltage: number;

  @IsNumber({}, { message: 'currentA harus berupa angka' })
  @IsNotEmpty({ message: 'currentA tidak boleh kosong' })
  currentA: number;

  @IsNumber({}, { message: 'power harus berupa angka' })
  @IsNotEmpty({ message: 'power tidak boleh kosong' })
  power: number;
}
