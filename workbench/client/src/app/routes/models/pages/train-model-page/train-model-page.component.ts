import { Dialog } from '@angular/cdk/dialog';
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { distinctUntilChanged, finalize, of, Subscription, switchMap, tap } from 'rxjs';
import {
  DatabaseTablesComponent,
  HyperParameterInputsComponent,
  LoadingComponent,
  TablePreviewDialog,
  TrainModelDataComponent,
  TrainTableJoinInputsComponent
} from '../../../../components';
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
    styleUrls: ['train-model-page.component.scss'],
    templateUrl: 'train-model-page.component.html',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        IpAnonymizationPipe,
        DatabaseTablesComponent,
        TrainModelDataComponent,
        LoadingComponent,
        HyperParameterInputsComponent,
        TrainTableJoinInputsComponent
    ]
})
export class TrainModelPageComponent implements OnInit, OnDestroy {
  selected: { schema: string; table: Table; }[] = [];
  readonly conflictName = signal(false);
  readonly databaseList = signal<FindDatabase[]>([]);
  readonly schemas = signal<Schema[]>([]);
  readonly columnsLoading = signal(false);
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
      schemas: [null, [Validators.required]],
      on: [],
      modeltype: [null, [Validators.required]],
      sample: [null],
      options: [null, [Validators.required]],
    });
    this.loadDatabases();
    this.loadHyperParameters();
    effect(() => {
    });
  }

  selectTable(event: { schema: string; table: Table; }) {
    const idx = this.selected.findIndex(s => s.schema === event.schema && s.table.name === event.table.name);
    if (idx === -1) {
      this.selected.push(event);
      const databaseId = this.formGroup.get('database_id')!.value;
      const schemas = this.formGroup.get('schemas')!.value ?? [];
      this.formGroup.get('schemas')!.setValue([...schemas, { schema: event.schema, table: { ...event.table, columns: [] } }]);
      console.log(this.formGroup.getRawValue());
    } else {
      this.selected.splice(idx, 1);
    }
  }

  changeSelectedColumns(index: number, columns: Column[]) {
    const schemas = this.formGroup.get('schemas')!.value;
    schemas[index].table.columns = columns;
    this.formGroup.get('schemas')!.setValue([...schemas]);
  }

  changeJoinColumns(event: [string, string][]) {
    this.formGroup.get('on')!.setValue(event);
  }

  preview({ schema, table }: { schema: string; table: Table }) {
    console.log(schema, table);

    const finded = this.formGroup.get('schemas')!.value.find((s: any) => s.schema === schema && s.table.name === table.name);
    console.log(finded);
    const database_id = this.formGroup.get('database_id')!.value;

    this.dialog.open(TablePreviewDialog, {
      data: {
        database_id,
        schema,
        table: table.name,
        columns: finded?.table.columns.map((c: Column) => c.name) ?? [],
      }
    });
  }

  changeHyperParameters(params: TrainModelOption[]) {
    this.formGroup.get('options')?.setValue(params.length > 0 ? params : null);
  }

  submit() {
    const dto = this.formGroup.getRawValue();
    dto.schemas.forEach((s: any) => s.table.columns = s.table.columns.map((c: Column) => c.name));
    console.log('DTO:::', dto);
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
          this.selected = [];
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
