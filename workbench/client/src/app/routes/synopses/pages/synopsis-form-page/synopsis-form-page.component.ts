import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, map, Subscription } from 'rxjs';
import { LoadingComponent } from '../../../../components';
import { FindDatabase, Model } from '../../../../dto';
import { IpAnonymizationPipe } from '../../../../pipes';
import { DatabaseService, ModelService, ModeltypeService, SynopsisService, TraindbService } from '../../../../services';

@Component({
  selector: 'etri-synopsis-form-page',
  standalone: true,
  styleUrls: ['synopsis-form-page.component.scss'],
  templateUrl: 'synopsis-form-page.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    RouterLink,
    IpAnonymizationPipe
  ]
})
export class SynopsisFormPageComponent implements OnInit, OnDestroy {
  conflictName = false;
  submitting = false;
  readonly databases = signal<FindDatabase[]>([]);
  readonly models = signal<Model[]>([]);
  readonly formGroup: FormGroup;

  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);
  private readonly modeltypeService = inject(ModeltypeService);
  private readonly modelService = inject(ModelService);
  private readonly synopsisService = inject(SynopsisService);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [Validators.required]],
      database: [null, Validators.required],
      model: [null, [Validators.required]],
      limit_rows: [null, [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      is_percent: [false]
    });
    this.formGroup.setValidators([
      (control: AbstractControl) => {
        const isPercent = !!control.get('is_percent')?.value;
        const rows = +(control.get('limit_rows')?.value || '');
        let err = false;
        if (isNaN(rows)) err = true;
        else if (rows < 0) err = true;
        else if (isPercent && rows > 100) err = true;
        return err ? { invalidRows: true } : null;
      }
    ]);
    this.loadDatabases();
    this.loadModels();
  }

  submit() {
    this.submitting = true;
    const { database, ...dto } = this.formGroup.getRawValue();
    this.synopsisService.createSynopsis(database, dto).pipe(
      finalize(() => this.submitting = false)
    ).subscribe({
      next: () => this.router.navigate(['/synopses']),
      error: err => {
        console.error(err);
        if (err.status === 409) {
          this.conflictName = true;
          alert('이미 사용 중인 시놉시스명입니다.');
          return;
        }
        alert(`Error: ${err.error?.detail ?? err.message}`);
      },
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.formGroup.get('name')?.valueChanges?.subscribe(() => this.conflictName = false)
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadDatabases() {
    const traindbId = this.traindbService.currentId();
    this.databaseService.searchDatabases(traindbId!).subscribe({
      next: list => this.databases.set(list),
      error: console.error
    });
  }

  private loadModels() {
    const traindbId = this.traindbService.currentId();
    forkJoin([
      this.modelService.searchModels(traindbId!),
      this.modeltypeService.searchModeltypes(traindbId!)
    ]).pipe(
      map(([models, modeltypes]) => {
        return models
          .filter(model => model.status === 'ENABLED' && model.training_status === 'FINISHED')
          .filter(model => modeltypes.find(modeltype => modeltype.name === model.modeltype)?.category === 'SYNOPSIS');
      })
    ).subscribe({
      next: list => this.models.set(list),
      error: console.error
    });
  }
}
