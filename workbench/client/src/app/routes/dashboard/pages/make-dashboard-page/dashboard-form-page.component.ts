import { JsonPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, Subscription, tap } from 'rxjs';
import {
  DashboardItemInputComponent,
  LoadingComponent,
  PlusIconComponent,
  QuerySelectComponent
} from '../../../../components';
import { FindQuery, RunQuery } from '../../../../dto';
import { QueryService, TraindbService } from '../../../../services';

@Component({
  selector: 'etri-dashboard-form-page',
  standalone: true,
  styleUrls: ['dashboard-form-page.component.scss'],
  templateUrl: 'dashboard-form-page.component.html',
  imports: [
    ReactiveFormsModule,
    QuerySelectComponent,
    LoadingComponent,
    RouterLink,
    JsonPipe,
    PlusIconComponent,
    DashboardItemInputComponent
  ]
})
export class DashboardFormPageComponent implements OnInit, OnDestroy {
  submitting = false;
  readonly formGroup: FormGroup;
  readonly queryService = inject(QueryService);
  readonly queryData = signal<RunQuery | null>(null);
  private readonly traindbService = inject(TraindbService);
  private readonly route = inject(ActivatedRoute);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [Validators.required]],
      query_id: [null, [Validators.required]],
      items: [[], [(control: AbstractControl) => {
        const value = control.value;
        return (value ?? []).length > 0 ? null : { required: true };
      }]],
    });
  }

  executeQuery(query: FindQuery) {
    this.queryService.runQuery(query.id)
      .pipe(
        tap(res => console.log(JSON.stringify(res)))
      )
      .subscribe({
      next: data => this.queryData.set(data),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    });
  }

  submit() {
    const dto = this.formGroup.getRawValue();
    dto.traindb_id = this.traindbService.currentId()!;
    console.log(dto);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.route.params.pipe(
        map(params => params['id'] ?? null),
      ).subscribe()
    );

    this.subscription.add(
      this.formGroup.get('query_id')?.valueChanges.subscribe(() => this.queryData.set(null)),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
