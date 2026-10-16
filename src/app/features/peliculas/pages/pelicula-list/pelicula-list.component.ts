import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PeliculaService } from '@core/services';
import { Pelicula } from '@core/models';

@Component({
  selector: 'app-pelicula-list',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="page">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <p class="hero-label">En cartelera</p>
          <h1 class="hero-title">Películas <span class="gold">disponibles</span></h1>
          <p class="hero-sub">Selecciona una película para ver sus funciones y reservar tu asiento</p>
        </div>
        <a routerLink="/peliculas/nueva" class="btn-add">
          <span>＋</span> Nueva película
        </a>
      </section>

      <!-- Grid -->
      <section class="grid-section">
        @if (loading()) {
          <div class="skeleton-grid">
            @for (n of [1,2,3,4,5,6]; track n) {
              <div class="skeleton-card">
                <div class="skeleton skeleton-poster"></div>
                <div class="skeleton skeleton-line w80"></div>
                <div class="skeleton skeleton-line w50"></div>
              </div>
            }
          </div>
        }

        @if (error()) {
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{{ error() }}</p>
          </div>
        }

        @if (!loading() && !error()) {
          <div class="movies-grid">
            @for (p of peliculas(); track p.id) {
              <article class="movie-card fade-in">
                <div class="card-poster-wrap">
                  <img [src]="p.imagen_url" [alt]="p.titulo" class="card-poster" loading="lazy" />
                  <div class="card-overlay">
                    <span class="badge-clasificacion">{{ p.clasificacion }}</span>
                    <a [routerLink]="['/peliculas', p.id]" class="btn-ver">Ver funciones →</a>
                  </div>
                  <div class="card-genero">{{ p.genero }}</div>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ p.titulo }}</h3>
                  <div class="card-meta">
                    <span class="meta-tag">⏱ {{ p.duracion }} min</span>
                    <span class="meta-tag gold">{{ p.clasificacion }}</span>
                  </div>
                  <p class="card-sinopsis">{{ p.sinopsis | slice:0:90 }}...</p>
                  <div class="card-actions">
                    <a [routerLink]="['/peliculas', p.id]" class="btn-primary">Ver funciones</a>
                    <a [routerLink]="['/peliculas', p.id, 'editar']" class="btn-ghost">Editar</a>
                    <button class="btn-danger" (click)="eliminar(p)" title="Eliminar película">🗑</button>
                  </div>
                </div>
              </article>
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
      position: relative;
      padding: 4rem 2rem 3rem;
      overflow: hidden;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      border-bottom: 1px solid var(--glass-bdr);
    }
    .hero-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 20% 50%, rgba(45,106,159,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 50%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--gold-500);
      margin-bottom: 0.5rem;
    }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
      margin-bottom: 0.75rem;
    }
    .gold { color: var(--gold-400); }
    .hero-sub { color: var(--text-secondary); font-size: 0.95rem; max-width: 480px; }

    .btn-add {
      position: relative; z-index: 1;
      align-self: center;
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.7rem 1.4rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950);
      font-weight: 700; font-size: 0.875rem; letter-spacing: 0.5px;
      border-radius: var(--radius-md);
      box-shadow: var(--glow-gold);
      transition: all var(--transition);
    }
    .btn-add:hover {
      background: linear-gradient(135deg, var(--gold-500), var(--gold-300));
      box-shadow: 0 0 28px rgba(201,168,76,0.5);
      transform: translateY(-2px);
    }

    /* Grid */
    .grid-section { padding: 2.5rem 2rem; max-width: 1300px; margin: 0 auto; }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    /* Card */
    .movie-card {
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all var(--transition);
    }
    .movie-card:hover {
      transform: translateY(-4px);
      border-color: rgba(201,168,76,0.3);
      box-shadow: var(--shadow-md), 0 0 32px rgba(201,168,76,0.08);
    }

    .card-poster-wrap {
      position: relative;
      height: 320px;
      overflow: hidden;
    }
    .card-poster {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform var(--transition-slow);
    }
    .movie-card:hover .card-poster { transform: scale(1.05); }

    .card-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(10,15,30,0.9) 0%, transparent 50%);
      display: flex; flex-direction: column;
      justify-content: flex-end; align-items: flex-start;
      padding: 1rem;
      opacity: 0;
      transition: opacity var(--transition);
    }
    .movie-card:hover .card-overlay { opacity: 1; }

    .badge-clasificacion {
      background: rgba(201,168,76,0.9);
      color: var(--blue-950);
      font-size: 0.7rem; font-weight: 800; letter-spacing: 1px;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    .btn-ver {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem; font-weight: 600;
      transition: all var(--transition);
    }
    .btn-ver:hover { background: rgba(201,168,76,0.3); border-color: var(--gold-400); }

    .card-genero {
      position: absolute; top: 0.75rem; right: 0.75rem;
      background: rgba(10,15,30,0.8);
      backdrop-filter: blur(8px);
      border: 1px solid var(--glass-bdr);
      border-radius: 99px;
      padding: 0.2rem 0.7rem;
      font-size: 0.7rem; color: var(--text-secondary);
    }

    .card-body { padding: 1.25rem; }
    .card-title {
      font-size: 1rem; font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }
    .card-meta { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .meta-tag {
      font-size: 0.72rem; font-weight: 600;
      background: var(--blue-700);
      color: var(--text-secondary);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }
    .meta-tag.gold { background: rgba(201,168,76,0.1); color: var(--gold-400); border: 1px solid rgba(201,168,76,0.2); }

    .card-sinopsis { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem; }

    .card-actions { display: flex; gap: 0.5rem; }
    .btn-primary {
      flex: 1; text-align: center;
      padding: 0.5rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950);
      font-weight: 700; font-size: 0.8rem;
      border-radius: var(--radius-sm);
      transition: all var(--transition);
    }
    .btn-primary:hover { background: linear-gradient(135deg, var(--gold-500), var(--gold-300)); box-shadow: var(--glow-gold); }
    .btn-ghost {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 0.8rem;
      transition: all var(--transition);
    }
    .btn-ghost:hover { border-color: var(--blue-400); color: var(--text-primary); background: var(--glass-md); }

    .btn-danger {
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: var(--radius-sm);
      background: rgba(239,68,68,0.08);
      color: #f87171;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all var(--transition);
    }
    .btn-danger:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5); }

    /* Skeleton */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .skeleton-card { border-radius: var(--radius-lg); overflow: hidden; background: var(--glass); border: 1px solid var(--glass-bdr); padding-bottom: 1rem; }
    .skeleton-poster { height: 320px; }
    .skeleton-line { height: 14px; margin: 0.75rem 1rem 0; }
    .w80 { width: 80%; }
    .w50 { width: 50%; }

    /* Error */
    .error-state { text-align: center; padding: 4rem; color: #f87171; }
    .error-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
  `],
})
export class PeliculaListComponent implements OnInit {
  private readonly peliculaService = inject(PeliculaService);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.peliculaService.getAll().subscribe({
      next: (data) => { this.peliculas.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message ?? 'Error al cargar películas'); this.loading.set(false); },
    });
  }

  eliminar(pelicula: Pelicula): void {
    if (!confirm(`¿Eliminar la película "${pelicula.titulo}"?`)) return;
    this.peliculaService.delete(pelicula.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo eliminar la película'),
    });
  }
}
