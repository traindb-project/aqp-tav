import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, computed, effect, inject, input, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Column, FindDatabase, HyperParameter, Model, TrainModelOption } from '../../../../dto';
import { DatabaseService, HyperParameterService, ModelService, TraindbService } from '../../../../services';
import { HyperParameterInputsComponent, TrainTableConditionInputsComponent } from '../../../../components';
import { IpAnonymizationPipe } from "../../../../pipes/ip-anonymization.pipe";

@Component({
    imports: [
        DatePipe,
        DecimalPipe,
        HyperParameterInputsComponent,
        TrainTableConditionInputsComponent,
        PercentPipe,
        ReactiveFormsModule,
        IpAnonymizationPipe
    ],
    selector: 'etri-additional-train-model-page',
    styleUrls: ['additional-train-model.component.scss'],
    templateUrl: 'additional-train-model.component.html'
})
export class AdditionalTrainModelPageComponent implements OnInit, OnDestroy {
  readonly model: WritableSignal<Model | null> = signal(null);
  readonly databaseList = signal<FindDatabase[]>([]);
  readonly columns: Signal<string[]> = computed(() => {
    const model = this.model();
    if (!model) return [];
    const { schemas } = model;
    return schemas.reduce((acc, schema) => {
      const { table } = schema;
      // wyjang: 나중에 스키마 추가
      // return acc.concat(table.columns.map(c => `${schema.schema}.${table.name}.${c}`));
      return acc.concat(table.columns.map(c => `${table.name}.${c}`));
    }, [] as string[]);
  });
  readonly hyperParameters: Signal<TrainModelOption[]> = computed(() => {
    const options = this.model()?.options;
    return Object.keys(options ?? {}).map(key => ({ name: key, value: options?.[key] }));
  });
  readonly hyperParameterList = signal<HyperParameter[]>([]);
  readonly tableConditions = signal<{ column: string; value: string | null }[]>([]);
  readonly conflictName: WritableSignal<boolean> = signal(false);
  readonly collapseInfo: WritableSignal<boolean> = signal(true);
  readonly formGroup: FormGroup;
  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);
  private readonly modelService = inject(ModelService);
  private readonly hyperParameterService = inject(HyperParameterService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      database_id: [null, [Validators.required]],
      name: [null, [Validators.required]],
      sample: [null],
      on: [null, [Validators.required]],
      options: [null],
    });
    this.loadDatabases();

    effect(() => {
      console.log(this.columns());
      console.log(this.tableConditions());
    });
  }

  changeHyperParameters(params: TrainModelOption[]) {
    this.formGroup.get('options')?.setValue(params.length > 0 ? params : null);
  }

  changeTableConditions(values: { column: string; value: string | null; }[]) {
    this.formGroup.get('on')?.setValue(values.length > 0 ? values : null);
  }

  getColumnNames(columns: string[]) {
    return columns.join(', ');
  }

  submit() {
    const dto = this.formGroup.getRawValue();
    dto.options = dto.options.map((c: any) => ({ name: c.name, value: String(c.value) }));
    dto.on = dto.on.filter((c: any) => c.value).map((c: any) => `${c.column} ${c.value}`);
    this.modelService.additionalTrainModel(this.model()?.name ?? '', dto).subscribe({
      next: () => this.router.navigate(['/models']),
      error: console.error,
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        this.findModel(params['name']);
      }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private findModel(name: string) {
    const traindbId = this.traindbService.currentId();
    this.modelService.searchModels(traindbId!).subscribe({
      next: list => {
        this.model.set(list.find(m => m.name === name) ?? null);
        this.tableConditions.set(this.model()?.schemas.flatMap(s => s.table.columns.map(c => ({ column: c, value: null }))) ?? []);
        this.searchHyperParameters(this.model()?.modeltype ?? '');
      },
      error: console.error,
    });
  }

  private searchHyperParameters(modeltype: string) {
    const traindbId = this.traindbService.currentId();
    this.hyperParameterService.searchHyperParameters(traindbId!).subscribe({
      next: list => this.hyperParameterList.set(list.filter(p => p.modeltype === modeltype)),
      error: console.error,
    });
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
}
