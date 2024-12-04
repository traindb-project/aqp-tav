import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { TablePreviewRequest } from '../../../../dto';
import { TableService } from '../../../../services';
import { DialogHeaderDirective, LoadingComponent } from '../../../atoms';
import { BaseDialogComponent } from '../base-dialog';

@Component({
    imports: [
        BaseDialogComponent,
        DialogHeaderDirective,
        LoadingComponent,
        DecimalPipe
    ],
    selector: 'etri-table-preview-dialog_',
    styleUrls: ['table-preview-dialog.component.scss'],
    templateUrl: 'table-preview-dialog.component.html'
})
export class TablePreviewDialogComponent implements OnInit {
  readonly onClose = output<void>();
  readonly loading = signal(false);
  readonly databaseId = input.required<number>();
  readonly schema = input.required<string>();
  readonly table = input.required<string>();
  readonly selectedColumns = input.required<string[]>();
  readonly columns = signal<string[]>([]);
  readonly data = signal<Array<any[]>>([]);

  private readonly tableService = inject(TableService);

  ngOnInit() {
    this.loadPreviewTable();
  }

  isNumber(item: any) {
    return !isNaN(+item);
  }

  private loadPreviewTable() {
    const dto: TablePreviewRequest = {
      database_id: this.databaseId()!,
      schema: this.schema()!,
      table: this.table()!,
      columns: this.selectedColumns()!
    };

    this.loading.set(true);
    this.tableService.previewTable(dto).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: res => {
        this.columns.set(res.columns);
        this.data.set(res.data);
      },
      error: err => {
        console.error(err);
        alert(`데이터를 가져오는데 실패했습니다.\nError: ${err.error?.detail ?? err.message}`);
      }
    });
  }
}

@Component({
    imports: [
        TablePreviewDialogComponent
    ],
    selector: 'etri-table-preview-dialog',
    template: `
    <etri-table-preview-dialog_
      [databaseId]="data.database_id"
      [schema]="data.schema"
      [table]="data.table"
      [selectedColumns]="data.columns"
      (onClose)="dialogRef.close()"
    />
  `
})
export class TablePreviewDialog {
  readonly dialogRef = inject(DialogRef);
  readonly data: TablePreviewRequest = inject(DIALOG_DATA);
}
