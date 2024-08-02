import { Dialog } from '@angular/cdk/dialog';
import { JsonPipe } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { distinctUntilChanged, finalize, of, Subscription, switchMap, tap } from 'rxjs';
import {
  CircleStackIconComponent,
  HyperParameterInputsComponent,
  LoadingComponent,
  TableCellsIconComponent,
  TablePreviewDialog,
  TabsComponent,
  TrainModelDataComponent
} from '../../../../components';
import { DatabaseTablesComponent } from '../../../../components/molecules/database-tables';
import { Column, FindDatabase, HyperParameter, Schema, Table, TrainModelOption } from '../../../../dto';
import { IpAnonymizationPipe } from '../../../../pipes';
import {
  DatabaseService,
  HyperParameterService,
  ModelService,
  TableService,
  TraindbService
} from '../../../../services';

@Component({
  selector: 'etri-train-model-page',
  standalone: true,
  styleUrls: ['train-model-page.component.scss'],
  templateUrl: 'train-model-page.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IpAnonymizationPipe,
    CircleStackIconComponent,
    TableCellsIconComponent,
    DatabaseTablesComponent,
    TabsComponent,
    TrainModelDataComponent,
    LoadingComponent,
    JsonPipe,
    HyperParameterInputsComponent
  ]
})
export class TrainModelPageComponent implements OnInit, OnDestroy {
  selected: { schema: string; table: Table; } | null = null;
  readonly conflictName = signal(false);
  readonly databaseList = signal<FindDatabase[]>([]);
  readonly schemas = signal<Schema[]>([]);
  readonly columnsLoading = signal(false);
  readonly columns = signal<Column[]>([]);
  readonly selectedColumns = signal<Column[]>([]);
  readonly hyperParameterList = signal<HyperParameter[]>([]);
  readonly modeltypes = computed(() => [...new Set(this.hyperParameterList().map(param => param.modeltype))]);
  readonly hyperParameters = signal<HyperParameter[]>([]);
  readonly submitting = signal(false);

  readonly formGroup: FormGroup;
  readonly tableService = inject(TableService);
  private readonly databaseService = inject(DatabaseService);
  private readonly traindbService = inject(TraindbService);
  private readonly hyperParameterService = inject(HyperParameterService);
  private readonly modelService = inject(ModelService);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [Validators.required]],
      database_id: [null, [Validators.required]],
      schema: [null, [Validators.required]],
      table: [null, [Validators.required]],
      columns: [null, [Validators.required]],
      modeltype: [null, [Validators.required]],
      sample: [null],
      options: [null, [Validators.required]],
    });
    this.loadDatabases();
    this.loadHyperParameters();
    effect(() => {
      const columns = this.selectedColumns();
      this.formGroup.get('columns')?.setValue(columns.length > 0 ? columns.map(c => c.name) : null);
    });
  }

  selectTable(event: { schema: string; table: Table; }) {
    this.selected = event;
    this.formGroup.get('schema')?.setValue(event.schema);
    this.formGroup.get('table')?.setValue(event.table.name);
    const databaseId = this.formGroup.get('database_id')!.value;

    this.columnsLoading.set(true);
    this.tableService.describeTable(databaseId, event.schema, event.table.name).pipe(
      finalize(() => this.columnsLoading.set(false))
    ).subscribe({
      next: columns => {
        this.columns.set([...columns]);
        this.selectedColumns.set([...columns]);
      },
      error: console.error
    });
  }

  preview() {
    this.dialog.open(TablePreviewDialog, {
      data: {
        database_id: this.formGroup.get('database_id')!.value,
        schema: this.formGroup.get('schema')!.value,
        table: this.formGroup.get('table')!.value,
        columns: this.selectedColumns().map(col => col.name),
      }
    });
  }

  changeHyperParameters(params: TrainModelOption[]) {
    this.formGroup.get('options')?.setValue(params.length > 0 ? params : null);
  }

  submit() {
    const dto = this.formGroup.getRawValue();
    this.submitting.set(true);
    this.modelService.trainModel(dto).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => this.router.navigate(['/models']),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          alert('이미 사용 중인 모델명입니다.');
          this.conflictName.set(true);
          return;
        }
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    })
  }

  ngOnInit() {
    this.subscription.add(
      this.formGroup.get('database_id')!.valueChanges.pipe(
        distinctUntilChanged(),
        tap(() => {
          this.columns.set([]);
          this.selectedColumns.set([]);
          this.selected = null;
          this.formGroup.get('schema')?.reset();
          this.formGroup.get('table')?.reset();
          this.formGroup.get('columns')?.reset();
        }),
        switchMap(id => id ? this.tableService.searchTables(+id) : of([]))
      ).subscribe({
        next: schemas => this.schemas.set(schemas),
        error: console.error
      })
    );

    this.subscription.add(
      this.formGroup.get('modeltype')!.valueChanges.subscribe({
        next: modeltype => this.hyperParameters.set([...this.hyperParameterList().filter(param => param.modeltype === modeltype)]),
        error: console.error
      })
    );

    this.subscription.add(
      this.formGroup.get('name')!.valueChanges.subscribe(() => this.conflictName.set(false))
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadDatabases() {
    const traindbId = this.traindbService.currentId();
    this.databaseService.searchDatabases(traindbId!).subscribe({
      next: list => this.databaseList.set(list),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      },
    });
  }

  private loadHyperParameters() {
    const traindbId = this.traindbService.currentId();
    this.hyperParameterService.searchHyperParameters(traindbId!).subscribe({
      next: list => this.hyperParameterList.set(list),
      error: err => {
        console.error(err);
      }
    })
  }
}
