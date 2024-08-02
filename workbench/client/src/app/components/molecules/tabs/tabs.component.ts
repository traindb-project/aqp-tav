import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'etri-tabs',
  standalone: true,
  styleUrls: ['tabs.component.scss'],
  templateUrl: 'tabs.component.html',
})
export class TabsComponent {
  tabOptions = input<string[]>();
  selectedIndex = model<number | null>(null);
  selectOption = output<{ index: number; option: string }>();

  select(index: number, option: string) {
    this.selectedIndex.set(index);
    this.selectOption.emit({ index, option });
  }
}

