import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SalaService } from '@core/services';
import { CreateSalaDto, TipoSala } from '@core/models';

/**
 * Formulario reactivo para Crear / Editar una Sala.
 */
@Component({
  selector: 'app-sala-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page">
      <div class="form-card">
        <header class="form-header">
          <h1>{{ modoEdicion ? '✏️ Editar' : '🎭 Nueva' }} Sala</h1>
          <a routerLink="/salas" class="btn-back">← Volver</a>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

          <div class="field span-2">
            <label>Nombre de la Sala *</label>
            <input formControlName="nombre" placeholder="Ej: Sala 1 - IMAX" />
            @if (hasError('nombre', 'required')) {
              <span class="error-msg">El nombre es obligatorio</span>
            }
          </div>

          <div class="field">
            <label>Tipo de Sala *</label>
            <select formControlName="tipo">
              <option value="">— Seleccionar —</option>
              @for (tipo of tiposSala; track tipo) {
                <option [value]="tipo">{{ tipo }}</option>
              }
            </select>
            @if (hasError('tipo', 'required')) {
              <span class="error-msg">Selecciona un tipo</span>
            }
          </div>

          <div class="field">
            <label>Capacidad (asientos) *</label>
            <input formControlName="capacidad" type="number" min="1" placeholder="150" />
            @if (hasError('capacidad', 'required')) {
              <span class="error-msg">La capacidad es obligatoria</span>
            }
            @if (hasError('capacidad', 'min')) {
              <span class="error-msg">Debe ser al menos 1 asiento</span>
            }
          </div>

          <div class="field-checkbox">
            <input type="checkbox" formControlName="activa" id="activa" />
            <label for="activa">Sala activa</label>
          </div>

          @if (error()) {
            <p class="global-error">⚠️ {{ error() }}</p>
          }

          <div class="form-actions">
            <button type="button" routerLink="/salas" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit" [disabled]="loading() || form.invalid">
              @if (loading()) { Guardando... } @else { {{ modoEdicion ? 'Actualizar' : 'Crear Sala' }} }
            </button>
          </div>

        </form>
      </div>
    </section>
  `,
  styleUrls: ['../../../../shared/styles/form.styles.css'],
})
export class SalaFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly salaService = inject(SalaService);
  private readonly router = inject(Router);

  readonly tiposSala: TipoSala[] = ['2D', '3D', 'IMAX', '4DX', 'VIP'];
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly modoEdicion = !!this.id;

  form: FormGroup = this.fb.group({
    nombre:   ['', Validators.required],
    tipo:     ['', Validators.required],
    capacidad:[null, [Validators.required, Validators.min(1)]],
    activa:   [true],
  });

  ngOnInit(): void {
    if (this.id) {
      this.salaService.getById(this.id).subscribe({
        next: (s) => this.form.patchValue(s),
        error: () => this.error.set('No se pudo cargar la sala'),
      });
    }
  }

  hasError(campo: string, tipo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.hasError(tipo) && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);

    const dto = this.form.value as CreateSalaDto;
    const request$ = this.id
      ? this.salaService.update(this.id, dto)
      : this.salaService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/salas']),
      error: (err) => {
        this.error.set(err.message ?? 'Error al guardar');
        this.loading.set(false);
      },
    });
  }
}
