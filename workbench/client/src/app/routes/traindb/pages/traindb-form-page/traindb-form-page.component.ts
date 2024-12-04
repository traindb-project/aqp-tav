import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { delay, finalize, map, of, Subscription, switchMap, tap } from 'rxjs';
import { LoadingComponent } from '../../../../components';
import { TraindbService } from '../../../../services';

@Component({
    host: {
        class: 'page block mx-auto',
    },
    imports: [
        RouterLink,
        ReactiveFormsModule,
        LoadingComponent
    ],
    selector: 'etri-traindb-form-page',
    styleUrls: ['traindb-form-page.component.scss'],
    templateUrl: 'traindb-form-page.component.html'
})
export class TraindbFormPageComponent implements OnInit, OnDestroy {
  id: number | null = null;
  testConnectionStatus: 'success' | 'failure' | 'loading' | null = null;
  loading = false;
  readonly formGroup: FormGroup;
  private readonly traindbService = inject(TraindbService);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [Validators.required]],
      host: [null, [Validators.required]],
      port: [null, [Validators.required]],
      username: [null],
      password: [null],
    });
  }

  testConnection() {
    this.testConnectionStatus = 'loading';
    const dto = this.formGroup.getRawValue();
    this.traindbService.testConnection({
      host: dto.host,
      port: dto.port,
      username: dto.username,
      password: dto.password,
    }).pipe(
      delay(500)
    ).subscribe({
      next: ({ success }) => {
        this.testConnectionStatus = success ? 'success' : 'failure';
      },
      error: err => {
        console.error(err);
        this.testConnectionStatus = 'failure';
      }
    })
  }

  submit() {
    const dto = this.formGroup.getRawValue();
    this.loading = true;
    const observable = this.id ? this.traindbService.updateTrainDB(this.id, dto) : this.traindbService.createTrainDB(dto);
    observable.pipe(
      finalize(() => this.loading = false),
    ).subscribe({
      next: () => this.router.navigate(['/traindb']),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      }
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.route.params.pipe(
        map(params => params['id']),
        tap(id => this.id = id ? +id : null),
        switchMap(id => id ? this.traindbService.findTrainDB(+id) : of(null))
      ).subscribe({
        next: traindb => {
          if (traindb) this.formGroup.patchValue(traindb);
        },
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
