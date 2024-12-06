import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trainingStatusColor',
  standalone: true
})
export class TrainingStatusColorPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'TRAINING':
        return 'bg-[#2196F3] text-white border-0';
      case 'UNKNOWN':
        return 'bg-[#A0A0A0] text-white border-0';
      case 'PREPARING':
        return 'bg-[#FFC107] text-white border-0';
      case 'FINISHED':
        return 'bg-[#4CAF50] text-white border-0';
      case 'FAILED':
        return 'bg-[#F44336] text-white border-0';
      default:
        return 'text-gray-500';
    }
  }
}
