import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';

import { PeliculaService, FuncionHorarioService } from '@core/services';
import { Pelicula, FuncionHorario } from '@core/models';

/**
 * Página de detalle de película: info de la película y sus funciones disponibles.
 * Recibe el `id` como @Input (gracias a withComponentInputBinding en app.config).
 */
@Component({
  selector: 'app-pelicula-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="page">
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando película...</p>
        </div>
      }

      @if (pelicula()) {
        <!-- Backdrop + Header -->
        <header class="detail-hero">
          <div class="hero-backdrop" [style.background-image]="'url(' + pelicula()!.imagen_url + ')'"></div>
          <div class="hero-overlay"></div>

          <div class="hero-inner">
            <a routerLink="/peliculas" class="btn-back">← Volver a cartelera</a>

            <div class="hero-content">
              <img [src]="pelicula()!.imagen_url" [alt]="pelicula()!.titulo" class="poster" />

              <div class="info">
                <h1 class="titulo">{{ pelicula()!.titulo }}</h1>
                <div class="meta-pills">
                  <span class="meta-pill gold">{{ pelicula()!.clasificacion }}</span>
                  <span class="meta-pill">⏱ {{ pelicula()!.duracion }} min</span>
                  <span class="meta-pill blue">{{ pelicula()!.genero }}</span>
                </div>
                <p class="sinopsis">{{ pelicula()!.sinopsis }}</p>

                <a [routerLink]="['/peliculas', pelicula()!.id, 'editar']" class="btn-edit">✏️ Editar película</a>
              </div>
            </div>
          </div>
        </header>

        <!-- Funciones -->
        <section class="funciones-section">
          <h2 class="section-title">📅 Funciones disponibles</h2>

          @if (loadingFunciones()) {
            <div class="loading-state small">
              <div class="spinner"></div>
              <p>Cargando funciones...</p>
            </div>
          }

          @if (!loadingFunciones() && funciones().length === 0) {
            <div class="empty-state">
              <span>🎟️</span>
              <p>No hay funciones disponibles para esta película.</p>
            </div>
          }

          <div class="funciones-grid">
            @for (funcion of funciones(); track funcion.id) {
              <div class="funcion-card fade-in">
                <div class="funcion-fecha">
                  <span class="dia">{{ funcion.fecha | date:'dd' }}</span>
                  <span class="mes">{{ funcion.fecha | date:'MMM' }}</span>
                </div>

                <div class="funcion-info">
                  <span class="hora">⏰ {{ funcion.hora_inicio }}</span>
                  <span class="sala">🎭 {{ funcion.sala?.nombre ?? 'Sala ' + funcion.sala_id }}</span>
                  <span class="tipo">{{ funcion.sala?.tipo }}</span>
                </div>

                <div class="funcion-footer">
                  <span class="precio">S/ {{ funcion.precio | number:'1.2-2' }}</span>
                  <a [routerLink]="['/funcion-butacas', funcion.id]" class="btn-seleccionar">
                    Seleccionar asiento →
                  </a>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--blue-900); }

    /* ── Hero con backdrop ── */
    .detail-hero { position: relative; overflow: hidden; border-bottom: 1px solid var(--glass-bdr); }
    .hero-backdrop {
      position: absolute; inset: 0;
      background-size: cover; background-position: center 30%;
      filter: blur(28px) brightness(0.35);
      transform: scale(1.15);
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(10,15,30,0.55), var(--blue-900) 95%);
    }
    .hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 1.5rem 2rem 2.5rem; }

    .btn-back {
      display: inline-block;
      padding: 0.4rem 0.9rem;
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-sm);
      color: var(--text-secondary); font-size: 0.85rem;
      transition: all var(--transition);
      margin-bottom: 1.5rem;
    }
    .btn-back:hover { color: var(--gold-400); border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.05); }

    .hero-content { display: flex; gap: 2rem; align-items: flex-start; }
    .poster {
      width: 210px; height: 315px;
      object-fit: cover;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-bdr);
      box-shadow: var(--shadow-lg), 0 0 40px rgba(201,168,76,0.08);
      flex-shrink: 0;
    }

    .info { flex: 1; }
    .titulo { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); line-height: 1.15; margin-bottom: 1rem; }
    .meta-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .meta-pill {
      font-size: 0.75rem; font-weight: 700;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      color: var(--text-secondary);
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
    }
    .meta-pill.gold { background: rgba(201,168,76,0.1); color: var(--gold-400); border-color: rgba(201,168,76,0.25); }
    .meta-pill.blue { background: rgba(45,106,159,0.15); color: var(--blue-200); border-color: rgba(45,106,159,0.3); }

    .sinopsis { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; max-width: 640px; margin-bottom: 1.5rem; }

    .btn-edit {
      display: inline-block;
      padding: 0.5rem 1.1rem;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: var(--radius-sm);
      color: var(--gold-400); font-size: 0.85rem; font-weight: 600;
      transition: all var(--transition);
    }
    .btn-edit:hover { background: rgba(201,168,76,0.1); box-shadow: var(--glow-gold); }

    /* ── Funciones ── */
    .funciones-section { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }
    .section-title { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem; }

    .funciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .funcion-card {
      display: flex; align-items: center; gap: 1rem;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-md);
      padding: 1rem;
      transition: all var(--transition);
    }
    .funcion-card:hover { transform: translateY(-3px); border-color: rgba(201,168,76,0.25); box-shadow: var(--shadow-md); }

    .funcion-fecha {
      display: flex; flex-direction: column; align-items: center;
      min-width: 54px;
      padding: 0.5rem;
      background: rgba(201,168,76,0.08);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: var(--radius-sm);
    }
    .dia { font-size: 1.3rem; font-weight: 800; color: var(--gold-400); line-height: 1; }
    .mes { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); }

    .funcion-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
    .hora { font-weight: 700; color: var(--text-primary); font-size: 0.95rem; }
    .sala { font-size: 0.8rem; color: var(--text-secondary); }
    .tipo {
      align-self: flex-start;
      font-size: 0.65rem; font-weight: 800; letter-spacing: 1px;
      background: rgba(45,106,159,0.2);
      border: 1px solid rgba(45,106,159,0.35);
      color: var(--blue-200);
      padding: 0.1rem 0.5rem;
      border-radius: 99px;
    }

    .funcion-footer { display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
    .precio { font-size: 1.05rem; font-weight: 800; color: var(--gold-400); }
    .btn-seleccionar {
      padding: 0.4rem 0.8rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950);
      font-size: 0.75rem; font-weight: 700;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      transition: all var(--transition);
    }
    .btn-seleccionar:hover { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); box-shadow: var(--glow-gold); }

    /* ── Estados ── */
    .loading-state {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 5rem; color: var(--text-secondary);
    }
    .loading-state.small { padding: 2rem; }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--blue-700);
      border-top-color: var(--gold-500);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center; padding: 3rem;
      color: var(--text-muted);
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
    }
    .empty-state span { font-size: 2.5rem; }

    @media (max-width: 700px) {
      .hero-content { flex-direction: column; }
      .poster { width: 150px; height: 225px; }
      .titulo { font-size: 1.6rem; }
    }
  `],
})
export class PeliculaDetailComponent implements OnInit {
  @Input() id!: string;

  private readonly peliculaService = inject(PeliculaService);
  private readonly funcionHorarioService = inject(FuncionHorarioService);

  readonly pelicula = signal<Pelicula | null>(null);
  readonly funciones = signal<FuncionHorario[]>([]);
  readonly loading = signal(true);
  readonly loadingFunciones = signal(true);

  ngOnInit(): void {
    this.peliculaService.getById(this.id).subscribe({
      next: (p) => { this.pelicula.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });

    this.funcionHorarioService.getByPelicula(this.id).subscribe({
      next: (f) => { this.funciones.set(f); this.loadingFunciones.set(false); },
      error: () => this.loadingFunciones.set(false),
    });
  }
}
