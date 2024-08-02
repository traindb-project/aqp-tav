import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { finalize, map, of, Subscription, switchMap, tap } from 'rxjs';
import { LoadingComponent } from '../../../../components';
import { CreateQuery, FindDatabase, UpdateQuery } from '../../../../dto';
import { IpAnonymizationPipe } from '../../../../pipes';
import { DatabaseService, QueryService, TraindbService } from '../../../../services';

@Component({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    EditorComponent,
    IpAnonymizationPipe,
    LoadingComponent,
    RouterLink,
  ],
  selector: 'etri-query-form-page',
  standalone: true,
  styleUrls: ['query-form-page.component.scss'],
  templateUrl: 'query-form-page.component.html'
})
export class QueryFormPageComponent implements OnInit, OnDestroy {
  id: number | null = null;
  submitting = false;

  readonly editorOptions = {
    language: 'sql',
    automaticLayout: true,
    wordWrap: 'on',
    overviewRulerBorder: false,
    minimap: {
      enabled: false
    }
  };

  readonly formGroup: FormGroup;
  readonly databases = signal<FindDatabase[]>([]);

  private readonly traindbService = inject(TraindbService);
  private readonly databaseService = inject(DatabaseService);
  private readonly queryService = inject(QueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subscription = new Subscription();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      name: [null, [(control: AbstractControl) => !!(control.value || '').trim() ? null : { required: true }]],
      database_id: [null, [Validators.required]],
      sql: [null, [Validators.required, Validators.pattern(/^select\b[^;]+\bfrom\b[^;]+;\s*$/i)]],
    });
    this.loadDatabases();
  }

  submit() {
    const dto: CreateQuery | UpdateQuery = this.formGroup.getRawValue();
    dto.name = dto.name.trim();
    dto.traindb_id = this.traindbService.currentId()!;
    dto.is_approximate = /^select approximate .+/i.test(dto.sql);

    const observable = this.id ?
      this.queryService.updateQuery(this.id, dto) :
      this.queryService.createQuery(dto);

    this.submitting = true;
    observable.pipe(
      finalize(() => this.submitting = false),
    ).subscribe({
      next: () => this.router.navigate(['/queries']),
      error: err => {
        console.error(err);
        alert(`Error: ${err.error?.detail ?? err.message}`);
      },
    })
  }

  ngOnInit() {
    this.subscription.add(
      this.route.params.pipe(
        map(params => params['id']),
        tap(id => this.id = id ? +id : null),
        switchMap(id => id ? this.queryService.findQuery(+id) : of(null))
      ).subscribe({
        next: query => {
          if (query) this.formGroup.patchValue(query);
        }
      })
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
}
