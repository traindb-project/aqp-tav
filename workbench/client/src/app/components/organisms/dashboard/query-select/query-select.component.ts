import { Component, computed, forwardRef, inject, model, OnInit, output, Provider, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FindQuery } from '../../../../dto';
import { PatternFilterPipe } from '../../../../pipes';
import { QueryService, TraindbService } from '../../../../services';
import { LoadingComponent } from '../../../atoms';
import { SearchInputComponent } from '../../../molecules';

const VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => QuerySelectComponent),
  multi: true,
};

@Component({
    imports: [
        SearchInputComponent,
        FormsModule,
        LoadingComponent,
        RouterLink,
        PatternFilterPipe
    ],
    providers: [
        VALUE_ACCESSOR,
    ],
    selector: 'etri-query-select',
    styleUrls: ['query-select.component.scss'],
    templateUrl: 'query-select.component.html'
})
export class QuerySelectComponent implements ControlValueAccessor, OnInit {
  readonly value = model<number | null>(null);
  readonly disabled = model<boolean>();
  readonly onExecute = output<FindQuery>();
  readonly keyword = signal('');
  readonly queries = signal<FindQuery[]>([]);
  readonly query = computed(() => {
    const id = this.value();
    if (!id) return null;
    return this.queries().find(q => q.id === id) ?? null;
  });
  readonly sql = computed(() => this.query()?.sql ?? null);

  readonly queryService = inject(QueryService);
  private readonly traindbService = inject(TraindbService);
  private onChange: any;
  private onTouch: any;

  change(value: number | null): void {
    this.value.set(value);
    if (this.onChange) this.onChange(value);
  }

  writeValue(value: number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  ngOnInit(): void {
    this.queryService.searchQueries(this.traindbService.currentId()!).subscribe(queries => this.queries.set(queries));
  }
}
