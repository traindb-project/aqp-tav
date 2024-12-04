import { Component, input, output } from '@angular/core';
import { DialogHeaderDirective, XMarkIconComponent } from '../../../atoms';

@Component({
    imports: [
        XMarkIconComponent,
        DialogHeaderDirective
    ],
    selector: 'etri-base-dialog',
    styleUrls: ['base-dialog.component.scss'],
    templateUrl: 'base-dialog.component.html'
})
export class BaseDialogComponent {
  hiddenHeader = input(false);
  hiddenFooter = input(false);
  hiddenCloseButton = input(false);
  onClose = output<void>();
}
