import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FuncionHorarioService } from '@core/services';
import { FuncionHorario } from '@core/models';

@Component({
  selector: 'app-funcion-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="page">
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <p class="hero-label">Programación</p>
          <h1 class="hero-title">Funciones <span class="gold">disponibles</span></h1>
          <p class="hero-sub">Elige tu función y selecciona el mejor asiento de la sala</p>
        </div>
        <a routerLink="/funciones/nueva" class="btn-add">＋ Nueva función</a>
      </section>

      <section class="content">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando funciones...</p>
          </div>
        }

        @if (!loading()) {
          <div class="funciones-grid">
            @for (f of funciones(); track f.id) {
              <div class="funcion-card fade-in">
                <div class="funcion-poster">
                  @if (f.pelicula?.imagen_url) {
                    <img [src]="f.pelicula!.imagen_url" [alt]="f.pelicula!.titulo" />
                  } @else {
                    <div class="poster-placeholder">🎬</div>
                  }
                </div>

                <div class="funcion-body">
                  <h3 class="funcion-titulo">{{ f.pelicula?.titulo ?? 'Función #' + f.id }}</h3>

                  <div class="funcion-meta">
                    <span class="meta-chip">
                      📅 {{ f.fecha | date:'EEE dd/MM':'':'es' }}
                    </span>
                    <span class="meta-chip">⏰ {{ f.hora_inicio }}</span>
                    <span class="meta-chip tipo">{{ f.sala?.tipo }}</span>
                  </div>

                  <p class="funcion-sala">🎭 {{ f.sala?.nombre }}</p>

                  <div class="funcion-footer">
                    <span class="precio">S/ {{ f.precio | number:'1.2-2' }}</span>
                    <div class="funcion-actions">
                      <a [routerLink]="['/funciones', f.id, 'editar']" class="btn-ghost-sm">Editar</a>
                      <button class="btn-danger-sm" (click)="eliminar(f)" title="Eliminar función">🗑</button>
                      <a [routerLink]="['/funcion-butacas', f.id]" class="btn-seats">
                        🪑 Asientos
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (funciones().length === 0) {
              <div class="empty-state">
                <span>🎟️</span>
                <p>No hay funciones disponibles</p>
                <a routerLink="/funciones/nueva" class="btn-add-inline">Crear primera función</a>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--blue-900); }

    /* Hero */
    .hero {
      position: relative; overflow: hidden;
      padding: 4rem 2rem 3rem;
      display: flex; align-items: flex-start;
      justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;
      border-bottom: 1px solid var(--glass-bdr);
    }
    .hero-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 10% 30%, rgba(45,106,159,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--gold-500); margin-bottom: 0.5rem; }
    .hero-title { font-size: 2.5rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; margin-bottom: 0.75rem; }
    .gold { color: var(--gold-400); }
    .hero-sub { color: var(--text-secondary); font-size: 0.95rem; }
    .btn-add {
      position: relative; z-index: 1;
      align-self: center;
      padding: 0.7rem 1.4rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950); font-weight: 700; font-size: 0.875rem;
      border-radius: var(--radius-md); box-shadow: var(--glow-gold);
      transition: all var(--transition);
    }
    .btn-add:hover { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); transform: translateY(-2px); }

    /* Content */
    .content { padding: 2.5rem 2rem; max-width: 1300px; margin: 0 auto; }

    /* Grid */
    .funciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    /* Card */
    .funcion-card {
      display: flex;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all var(--transition);
      gap: 0;
    }
    .funcion-card:hover {
      transform: translateY(-3px);
      border-color: rgba(201,168,76,0.25);
      box-shadow: var(--shadow-md), 0 0 24px rgba(201,168,76,0.06);
    }

    .funcion-poster {
      width: 90px; flex-shrink: 0;
      overflow: hidden;
      background: var(--blue-800);
    }
    .funcion-poster img { width: 100%; height: 100%; object-fit: cover; }
    .poster-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      background: var(--blue-800);
    }

    .funcion-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .funcion-titulo { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); line-height: 1.3; }

    .funcion-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .meta-chip {
      font-size: 0.72rem; font-weight: 600;
      background: var(--blue-700);
      color: var(--text-secondary);
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
    }
    .meta-chip.tipo { background: rgba(45,106,159,0.2); color: var(--blue-200); border: 1px solid rgba(45,106,159,0.3); }

    .funcion-sala { font-size: 0.8rem; color: var(--text-muted); }

    .funcion-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--glass-bdr); }
    .precio { font-size: 1.1rem; font-weight: 800; color: var(--gold-400); }

    .funcion-actions { display: flex; gap: 0.4rem; }
    .btn-ghost-sm {
      padding: 0.3rem 0.6rem;
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.75rem;
      transition: all var(--transition);
    }
    .btn-ghost-sm:hover { color: var(--text-primary); border-color: var(--blue-400); background: var(--glass-md); }
    .btn-danger-sm {
      padding: 0.3rem 0.6rem;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: var(--radius-sm);
      background: rgba(239,68,68,0.08);
      color: #f87171;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all var(--transition);
    }
    .btn-danger-sm:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5); }
    .btn-seats {
      padding: 0.3rem 0.8rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950);
      font-size: 0.75rem; font-weight: 700;
      border-radius: var(--radius-sm);
      transition: all var(--transition);
    }
    .btn-seats:hover { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); box-shadow: var(--glow-gold); }

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

    .empty-state {
      grid-column: 1/-1; text-align: center; padding: 4rem;
      color: var(--text-muted);
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
    }
    .empty-state span { font-size: 3rem; }
    .btn-add-inline {
      padding: 0.6rem 1.4rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950); font-weight: 700; font-size: 0.875rem;
      border-radius: var(--radius-sm);
    }
  `],
})
export class FuncionListComponent implements OnInit {
  private readonly funcionService = inject(FuncionHorarioService);
  readonly funciones = signal<FuncionHorario[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.funcionService.getAll().subscribe({
      next: (data) => { this.funciones.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  eliminar(funcion: FuncionHorario): void {
    const nombre = funcion.pelicula?.titulo ?? `Función #${funcion.id}`;
    if (!confirm(`¿Eliminar la función de "${nombre}"?`)) return;
    this.funcionService.delete(funcion.id).subscribe({ next: () => this.cargar() });
  }
}
