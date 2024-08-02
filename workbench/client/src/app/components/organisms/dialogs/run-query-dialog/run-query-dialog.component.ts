import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FindQuery } from '../../../../dto';
import { QueryService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
  imports: [
    BaseDialogComponent,
    DialogHeaderDirective,
    LoadingComponent,
    DecimalPipe
  ],
  selector: 'etri-run-query-dialog_',
  standalone: true,
  styleUrls: ['run-query-dialog.component.scss'],
  templateUrl: 'run-query-dialog.component.html'
})
export class RunQueryDialogComponent implements OnInit {
  readonly onClose = output<void>();
  readonly loading = signal(false);
  readonly query = input.required<FindQuery>();
  readonly columns = signal<string[]>([]);
  readonly data = signal<Array<any[]>>([]);
  readonly executionTime = signal<number>(0);

  private readonly queryService = inject(QueryService);

  isNumber(item: any) {
    return !isNaN(+item);
  }

  ngOnInit() {
    this.runQuery();
  }

  private runQuery() {
    this.loading.set(true);
    this.queryService.runQuery(this.query().id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: res => {
        this.columns.set(res.columns);
        this.data.set(res.data);
        this.executionTime.set(res.execution_time);
      },
    })
  }
}

@Component({
  imports: [
    RunQueryDialogComponent
  ],
  selector: 'etri-run-query-dialog',
  standalone: true,
  template: `
    <etri-run-query-dialog_
      [query]="data"
      (onClose)="dialogRef.close()"
    />
  `
})
export class RunQueryDialog {
  readonly dialogRef = inject(DialogRef);
  readonly data: FindQuery = inject(DIALOG_DATA);
}
