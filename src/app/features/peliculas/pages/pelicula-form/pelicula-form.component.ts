import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PeliculaService } from '@core/services';
import { CreatePeliculaDto } from '@core/models';

/**
 * Formulario reactivo para Crear / Editar una Película.
 *
 * ALTA COHESIÓN: solo maneja el formulario de película.
 * MODO DUAL: si recibe `id` → modo edición (carga datos y hace PATCH),
 *            si no → modo creación (hace POST).
 */
@Component({
  selector: 'app-pelicula-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page">
      <div class="form-card">
        <header class="form-header">
          <h1>{{ modoEdicion ? '✏️ Editar' : '🎬 Nueva' }} Película</h1>
          <a routerLink="/peliculas" class="btn-back">← Volver</a>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

          <div class="field span-2">
            <label>Título *</label>
            <input formControlName="titulo" placeholder="Ej: Interstellar 2" />
            @if (hasError('titulo', 'required')) {
              <span class="error-msg">El título es obligatorio</span>
            }
          </div>

          <div class="field span-2">
            <label>Sinopsis *</label>
            <textarea formControlName="sinopsis" rows="4" placeholder="Describe la trama..."></textarea>
            @if (hasError('sinopsis', 'required')) {
              <span class="error-msg">La sinopsis es obligatoria</span>
            }
          </div>

          <div class="field">
            <label>Duración (minutos) *</label>
            <input formControlName="duracion" type="number" min="1" placeholder="120" />
            @if (hasError('duracion', 'required')) {
              <span class="error-msg">La duración es obligatoria</span>
            }
          </div>

          <div class="field">
            <label>Clasificación *</label>
            <select formControlName="clasificacion">
              <option value="">— Seleccionar —</option>
              <option>G</option><option>PG</option><option>PG-13</option>
              <option>R</option><option>NC-17</option>
            </select>
            @if (hasError('clasificacion', 'required')) {
              <span class="error-msg">Selecciona una clasificación</span>
            }
          </div>

          <div class="field">
            <label>Género *</label>
            <input formControlName="genero" placeholder="Ej: Ciencia Ficción" />
            @if (hasError('genero', 'required')) {
              <span class="error-msg">El género es obligatorio</span>
            }
          </div>

          <div class="field">
            <label>URL del Póster</label>
            <input formControlName="imagen_url" placeholder="https://..." />
          </div>

          <div class="field-checkbox">
            <input type="checkbox" formControlName="activo" id="activo" />
            <label for="activo">Película activa en cartelera</label>
          </div>

          @if (error()) {
            <p class="global-error">⚠️ {{ error() }}</p>
          }

          <div class="form-actions">
            <button type="button" routerLink="/peliculas" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit" [disabled]="loading() || form.invalid">
              @if (loading()) { Guardando... } @else { {{ modoEdicion ? 'Actualizar' : 'Crear Película' }} }
            </button>
          </div>

        </form>
      </div>
    </section>
  `,
  styleUrls: ['../../../../shared/styles/form.styles.css'],
})
export class PeliculaFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly peliculaService = inject(PeliculaService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly modoEdicion = !!this.id;

  form: FormGroup = this.fb.group({
    titulo:       ['', Validators.required],
    sinopsis:     ['', Validators.required],
    duracion:     [null, [Validators.required, Validators.min(1)]],
    clasificacion:['', Validators.required],
    genero:       ['', Validators.required],
    imagen_url:   [''],
    activo:       [true],
  });

  ngOnInit(): void {
    if (this.id) {
      this.peliculaService.getById(this.id).subscribe({
        next: (p) => this.form.patchValue(p),
        error: () => this.error.set('No se pudo cargar la película'),
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

    const dto = this.form.value as CreatePeliculaDto;
    const request$ = this.id
      ? this.peliculaService.update(this.id, dto)
      : this.peliculaService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/peliculas']),
      error: (err) => {
        this.error.set(err.message ?? 'Error al guardar');
        this.loading.set(false);
      },
    });
  }
}
