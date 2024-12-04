import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { delay, finalize, map, of, Subscription, switchMap, tap } from 'rxjs';
import { LoadingComponent } from '../../../../components';
import { DatabaseService, TraindbService } from '../../../../services';

@Component({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        LoadingComponent,
        RouterLink
    ],
    selector: 'etri-database-form-page',
    styleUrls: ['database-form-page.component.scss'],
    templateUrl: 'database-form-page.component.html'
})
export class DatabaseFormPageComponent implements OnInit, OnDestroy {
  id: number | null = null;
  testConnectionStatus: 'success' | 'failure' | 'loading' | null = null;
  submitting = false;

  readonly formGroup: FormGroup;

  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [Validators.required]],
      dbms: [null, [Validators.required]],
      host: [null, [Validators.required]],
      port: [null, [Validators.required]],
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      database: [null],
    });
  }

  testConnection() {
    const traindb = this.traindbService.current();
    this.testConnectionStatus = 'loading';
    const dto = this.formGroup.getRawValue();
    this.databaseService.testConnection({
      dbms: dto.dbms,
      host: dto.host,
      port: dto.port,
      username: dto.username,
      password: dto.password,
      server_host: traindb?.host ?? null,
      server_port: traindb?.port ?? null,
      database: dto.database || null,
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
    });
  }

  submit() {
    const traindbId = this.traindbService.currentId();
    if (!traindbId) return;

    const dto = { ...this.formGroup.getRawValue(), traindb_id: traindbId };
    dto.database = !(dto.database || '').trim() ? null : dto.database;
    const observable = this.id ?
      this.databaseService.updateDatabase(this.id, dto) :
      this.databaseService.createDatabase(dto);

    this.submitting = true;
    observable.pipe(
      finalize(() => this.submitting = false),
    ).subscribe({
      next: () => this.router.navigate(['/databases']),
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
        switchMap(id => id ? this.databaseService.findDatabase(id) : of(null))
      ).subscribe({
        next: database => {
          if (database) this.formGroup.patchValue(database);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
