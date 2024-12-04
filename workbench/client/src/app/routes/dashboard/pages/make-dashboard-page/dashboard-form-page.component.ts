import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, map, Subscription } from 'rxjs';
import {
  DashboardItemInputComponent,
  LoadingComponent,
  QuerySelectComponent
} from '../../../../components';
import { FindQuery, RunQuery } from '../../../../dto';
import { DashboardService, QueryService, TraindbService } from '../../../../services';

@Component({
    selector: 'etri-dashboard-form-page',
    styleUrls: ['dashboard-form-page.component.scss'],
    templateUrl: 'dashboard-form-page.component.html',
    imports: [
        ReactiveFormsModule,
        QuerySelectComponent,
        LoadingComponent,
        RouterLink,
        DashboardItemInputComponent
    ]
})
export class DashboardFormPageComponent implements OnInit, OnDestroy {
  submitting = false;
  readonly formGroup: FormGroup;
  readonly queryData = signal<RunQuery | null>(null);
  readonly queryService = inject(QueryService);
  readonly dashboardService = inject(DashboardService);
  private readonly traindbService = inject(TraindbService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
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
    this.submitting = true;
    this.dashboardService.createDashboard(dto).pipe(
      finalize(() => this.submitting = false),
    ).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
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
