import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FuncionHorarioService } from '@core/services';
import { FuncionHorario } from '@core/models';

/**
 * Detalle de una función específica: película, sala, horario y acceso al mapa de asientos.
 */
@Component({
  selector: 'app-funcion-detail',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="page">
      <header class="detail-header">
        <a routerLink="/funciones" class="btn-back">← Volver</a>
        @if (funcion()) {
          <div class="header-info">
            <h1 class="header-titulo">{{ funcion()!.pelicula?.titulo }}</h1>
            <div class="header-meta">
              <span class="meta-pill">📅 {{ funcion()!.fecha | date:'dd/MM/yyyy' }}</span>
              <span class="meta-pill">⏰ {{ funcion()!.hora_inicio }}</span>
              <span class="meta-pill blue">🎭 {{ funcion()!.sala?.nombre }}</span>
              <span class="meta-pill gold">{{ funcion()!.sala?.tipo }}</span>
            </div>
          </div>
          <a [routerLink]="['/funciones', funcion()!.id, 'editar']" class="btn-edit">✏️ Editar</a>
        }
      </header>

      <section class="content">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando función...</p>
          </div>
        }

        @if (funcion()) {
          <div class="detail-card fade-in">
            @if (funcion()!.pelicula?.imagen_url) {
              <img [src]="funcion()!.pelicula!.imagen_url" [alt]="funcion()!.pelicula!.titulo" class="poster" />
            }

            <div class="card-body">
              <div class="precio-block">
                <span class="precio-label">Precio por asiento</span>
                <span class="precio">S/ {{ funcion()!.precio | number:'1.2-2' }}</span>
              </div>

              <ul class="detalle-list">
                <li><span class="k">Película</span><span class="v">{{ funcion()!.pelicula?.titulo }}</span></li>
                <li><span class="k">Duración</span><span class="v">{{ funcion()!.pelicula?.duracion }} min</span></li>
                <li><span class="k">Clasificación</span><span class="v">{{ funcion()!.pelicula?.clasificacion }}</span></li>
                <li><span class="k">Sala</span><span class="v">{{ funcion()!.sala?.nombre }} ({{ funcion()!.sala?.tipo }})</span></li>
                <li><span class="k">Horario</span><span class="v">{{ funcion()!.fecha | date:'dd/MM/yyyy' }} · {{ funcion()!.hora_inicio }}</span></li>
                <li><span class="k">Estado</span><span class="v">{{ funcion()!.activa === false ? 'Inactiva' : 'Activa' }}</span></li>
              </ul>

              <a [routerLink]="['/funcion-butacas', funcion()!.id]" class="btn-seats">
                🪑 Ir al mapa de asientos →
              </a>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--blue-900); }

    /* Header */
    .detail-header {
      display: flex; align-items: center; gap: 1.5rem;
      padding: 1rem 2rem;
      background: rgba(3,7,18,0.6);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--glass-bdr);
      flex-wrap: wrap;
    }
    .btn-back {
      padding: 0.4rem 0.9rem;
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-sm);
      color: var(--text-secondary); font-size: 0.85rem;
      transition: all var(--transition);
      white-space: nowrap;
    }
    .btn-back:hover { color: var(--gold-400); border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.05); }
    .header-info { flex: 1; }
    .header-titulo { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }
    .header-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .meta-pill {
      font-size: 0.72rem; font-weight: 600;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      color: var(--text-secondary);
      padding: 0.2rem 0.65rem;
      border-radius: 99px;
    }
    .meta-pill.blue { background: rgba(45,106,159,0.15); color: var(--blue-200); border-color: rgba(45,106,159,0.3); }
    .meta-pill.gold { background: rgba(201,168,76,0.1); color: var(--gold-400); border-color: rgba(201,168,76,0.25); }
    .btn-edit {
      padding: 0.5rem 1.1rem;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: var(--radius-sm);
      color: var(--gold-400); font-size: 0.85rem; font-weight: 600;
      transition: all var(--transition);
      white-space: nowrap;
    }
    .btn-edit:hover { background: rgba(201,168,76,0.1); box-shadow: var(--glow-gold); }

    /* Contenido */
    .content { max-width: 720px; margin: 0 auto; padding: 2.5rem 2rem; }

    .detail-card {
      display: flex;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .poster { width: 170px; flex-shrink: 0; object-fit: cover; border-right: 1px solid var(--glass-bdr); }
    .card-body { flex: 1; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

    .precio-block {
      display: flex; flex-direction: column; gap: 0.2rem;
      padding: 0.9rem 1.1rem;
      background: rgba(201,168,76,0.07);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: var(--radius-sm);
    }
    .precio-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }
    .precio { font-size: 1.7rem; font-weight: 800; color: var(--gold-400); line-height: 1.1; }

    .detalle-list { list-style: none; display: flex; flex-direction: column; }
    .detalle-list li {
      display: flex; justify-content: space-between; gap: 1rem;
      padding: 0.55rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 0.875rem;
    }
    .detalle-list li:last-child { border-bottom: none; }
    .k { color: var(--text-muted); font-weight: 600; }
    .v { color: var(--text-primary); font-weight: 600; text-align: right; }

    .btn-seats {
      text-align: center;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950);
      font-weight: 800; font-size: 0.9rem;
      border-radius: var(--radius-sm);
      box-shadow: var(--glow-gold);
      transition: all var(--transition);
    }
    .btn-seats:hover { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); transform: translateY(-2px); }

    /* Estados */
    .loading-state {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 5rem; color: var(--text-secondary);
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--blue-700);
      border-top-color: var(--gold-500);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .detail-card { flex-direction: column; }
      .poster { width: 100%; height: 180px; border-right: none; border-bottom: 1px solid var(--glass-bdr); }
    }
  `],
})
export class FuncionDetailComponent implements OnInit {
  @Input() id!: string;

  private readonly funcionService = inject(FuncionHorarioService);
  readonly funcion = signal<FuncionHorario | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.funcionService.getById(this.id).subscribe({
      next: (f) => { this.funcion.set(f); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
