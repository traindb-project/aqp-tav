import { Component, computed, input, InputSignal } from '@angular/core';
import { FindTrainDBDto } from '../../../dto';
import { IpAnonymizationPipe } from '../../../pipes';

@Component({
  host: {
    class: 'flex items-center gap-4 py-2 px-4 bg-white'
  },
  selector: 'etri-traindb-banner',
  standalone: true,
  styleUrls: ['traindb-banner.component.scss'],
  templateUrl: 'traindb-banner.component.html',
  imports: [
    IpAnonymizationPipe
  ]
})
export class TraindbBannerComponent {
  readonly traindb: InputSignal<FindTrainDBDto | null> = input<FindTrainDBDto | null>(null);
  readonly name = computed(() => this.traindb()?.name ?? null);
  readonly host = computed(() => this.traindb()?.host ?? null);
  readonly port = computed(() => this.traindb()?.port ?? null);
}
