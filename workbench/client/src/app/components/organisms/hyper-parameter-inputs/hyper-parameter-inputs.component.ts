import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HyperParameter, TrainModelOption } from '../../../dto';

@Component({
    imports: [
        FormsModule
    ],
    selector: 'etri-hyper-parameter-inputs',
    styleUrls: ['hyper-parameter-inputs.component.scss'],
    templateUrl: 'hyper-parameter-inputs.component.html'
})
export class HyperParameterInputsComponent {
  hyperparameters = input<HyperParameter[]>([]);
  parameterValues = input<TrainModelOption[]>([]);
  value: TrainModelOption[] = [];
  onChange = output<TrainModelOption[]>();

  constructor() {
    effect(() => {
      this.value = this.hyperparameters().map(params => ({ name: params.name, value: this.parameterValues().find(v => v.name === params.name)?.value ?? '' }));
      this.onChange.emit(this.value);
    });
  }

  changeValue(i: number, value: string) {
    this.value[i].value = value;
    this.onChange.emit([...this.value]);
  }
}
