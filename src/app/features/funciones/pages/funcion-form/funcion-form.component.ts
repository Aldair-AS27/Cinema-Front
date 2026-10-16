import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { FuncionHorarioService, SalaService, PeliculaService } from '@core/services';
import { CreateFuncionHorarioDto, Pelicula, Sala } from '@core/models';

/**
 * Formulario reactivo para Crear / Editar una Función Horario (cartelera).
 * Carga las listas de películas y salas disponibles para los selects.
 */
@Component({
  selector: 'app-funcion-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page">
      <div class="form-card">
        <header class="form-header">
          <h1>{{ modoEdicion ? '✏️ Editar' : '🎟️ Nueva' }} Función</h1>
          <a routerLink="/funciones" class="btn-back">← Volver</a>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">

          <div class="field span-2">
            <label>Película *</label>
            <select formControlName="pelicula_id">
              <option value="">— Seleccionar película —</option>
              @for (p of peliculas(); track p.id) {
                <option [value]="p.id">{{ p.titulo }} ({{ p.duracion }} min)</option>
              }
            </select>
            @if (hasError('pelicula_id', 'required')) {
              <span class="error-msg">Selecciona una película</span>
            }
          </div>

          <div class="field span-2">
            <label>Sala *</label>
            <select formControlName="sala_id">
              <option value="">— Seleccionar sala —</option>
              @for (s of salas(); track s.id) {
                <option [value]="s.id">{{ s.nombre }} ({{ s.tipo }} · {{ s.capacidad }} asientos)</option>
              }
            </select>
            @if (hasError('sala_id', 'required')) {
              <span class="error-msg">Selecciona una sala</span>
            }
          </div>

          <div class="field">
            <label>Fecha *</label>
            <input formControlName="fecha" type="date" />
            @if (hasError('fecha', 'required')) {
              <span class="error-msg">La fecha es obligatoria</span>
            }
          </div>

          <div class="field">
            <label>Hora de Inicio *</label>
            <input formControlName="hora_inicio" type="time" />
            @if (hasError('hora_inicio', 'required')) {
              <span class="error-msg">La hora es obligatoria</span>
            }
          </div>

          <div class="field">
            <label>Precio (S/) *</label>
            <input formControlName="precio" type="number" min="0" step="0.50" placeholder="25.00" />
            @if (hasError('precio', 'required')) {
              <span class="error-msg">El precio es obligatorio</span>
            }
            @if (hasError('precio', 'min')) {
              <span class="error-msg">El precio debe ser positivo</span>
            }
          </div>

          <div class="field-checkbox">
            <input type="checkbox" formControlName="activa" id="activa" />
            <label for="activa">Función activa</label>
          </div>

          @if (error()) {
            <p class="global-error">⚠️ {{ error() }}</p>
          }

          <div class="form-actions">
            <button type="button" routerLink="/funciones" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-submit" [disabled]="loading() || form.invalid">
              @if (loading()) { Guardando... } @else { {{ modoEdicion ? 'Actualizar' : 'Crear Función' }} }
            </button>
          </div>

        </form>
      </div>
    </section>
  `,
  styleUrls: ['../../../../shared/styles/form.styles.css'],
})
export class FuncionFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb = inject(FormBuilder);
  private readonly funcionService = inject(FuncionHorarioService);
  private readonly peliculaService = inject(PeliculaService);
  private readonly salaService = inject(SalaService);
  private readonly router = inject(Router);

  readonly peliculas = signal<Pelicula[]>([]);
  readonly salas = signal<Sala[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly modoEdicion = !!this.id;

  form: FormGroup = this.fb.group({
    pelicula_id:  ['', Validators.required],
    sala_id:      ['', Validators.required],
    fecha:        ['', Validators.required],
    hora_inicio:  ['', Validators.required],
    precio:       [null, [Validators.required, Validators.min(0)]],
    activa:       [true],
  });

  ngOnInit(): void {
    // Carga las listas para los selects
    this.peliculaService.getAll().subscribe({ next: (p) => this.peliculas.set(p) });
    this.salaService.getAll().subscribe({ next: (s) => this.salas.set(s) });

    if (this.id) {
      this.funcionService.getById(this.id).subscribe({
        next: (f) => this.form.patchValue(f),
        error: () => this.error.set('No se pudo cargar la función'),
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

    const dto = this.form.value as CreateFuncionHorarioDto;
    const request$ = this.id
      ? this.funcionService.update(this.id, dto)
      : this.funcionService.create(dto);

    request$.subscribe({
      next: () => this.router.navigate(['/funciones']),
      error: (err) => {
        this.error.set(err.message ?? 'Error al guardar');
        this.loading.set(false);
      },
    });
  }
}
