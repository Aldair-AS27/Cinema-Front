import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SalaService } from '@core/services';
import { Sala } from '@core/models';

/**
 * Página de listado de salas.
 * CRUD: crear (botón hero), ver detalle, editar y eliminar por tarjeta.
 */
@Component({
  selector: 'app-sala-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <p class="hero-label">Infraestructura</p>
          <h1 class="hero-title">Nuestras <span class="gold">salas</span></h1>
          <p class="hero-sub">Explora la capacidad y distribución de butacas de cada sala</p>
        </div>
        <a routerLink="/salas/nueva" class="btn-add">＋ Nueva sala</a>
      </section>

      <!-- Grid -->
      <section class="grid-section">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando salas...</p>
          </div>
        }

        @if (!loading()) {
          <div class="salas-grid">
            @for (sala of salas(); track sala.id) {
              <article class="sala-card fade-in">
                <div class="sala-head">
                  <span class="sala-tipo">{{ sala.tipo }}</span>
                  @if (sala.activa === false) {
                    <span class="badge-inactiva">Inactiva</span>
                  }
                </div>

                <h3 class="sala-nombre">🎭 {{ sala.nombre }}</h3>

                <div class="sala-meta">
                  <span class="meta-tag">🪑 {{ sala.capacidad }} asientos</span>
                </div>

                <div class="sala-actions">
                  <a [routerLink]="['/salas', sala.id]" class="btn-primary">Ver butacas</a>
                  <a [routerLink]="['/salas', sala.id, 'editar']" class="btn-ghost">Editar</a>
                  <button class="btn-danger" (click)="eliminar(sala)" title="Eliminar sala">🗑</button>
                </div>
              </article>
            }

            @if (salas().length === 0) {
              <div class="empty-state">
                <span>🎭</span>
                <p>No hay salas registradas</p>
                <a routerLink="/salas/nueva" class="btn-add-inline">Crear primera sala</a>
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
      background: radial-gradient(ellipse at 20% 50%, rgba(45,106,159,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.06) 0%, transparent 50%);
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

    /* Grid */
    .grid-section { padding: 2.5rem 2rem; max-width: 1300px; margin: 0 auto; }
    .salas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    /* Card */
    .sala-card {
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      display: flex; flex-direction: column; gap: 0.9rem;
      transition: all var(--transition);
    }
    .sala-card:hover {
      transform: translateY(-3px);
      border-color: rgba(201,168,76,0.25);
      box-shadow: var(--shadow-md), 0 0 24px rgba(201,168,76,0.06);
    }

    .sala-head { display: flex; justify-content: space-between; align-items: center; }
    .sala-tipo {
      font-size: 0.72rem; font-weight: 800; letter-spacing: 1.5px;
      background: rgba(45,106,159,0.2);
      border: 1px solid rgba(45,106,159,0.35);
      color: var(--blue-200);
      padding: 0.2rem 0.7rem;
      border-radius: 99px;
    }
    .badge-inactiva {
      font-size: 0.7rem; font-weight: 700;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      color: #f87171;
      padding: 0.15rem 0.6rem;
      border-radius: 99px;
    }

    .sala-nombre { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
    .sala-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .meta-tag {
      font-size: 0.75rem; font-weight: 600;
      background: var(--blue-700);
      color: var(--text-secondary);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }

    .sala-actions {
      display: flex; gap: 0.5rem;
      margin-top: auto;
      padding-top: 0.9rem;
      border-top: 1px solid var(--glass-bdr);
    }
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
export class SalaListComponent implements OnInit {
  private readonly salaService = inject(SalaService);

  readonly salas = signal<Sala[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.salaService.getAll().subscribe({
      next: (data) => { this.salas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  eliminar(sala: Sala): void {
    if (!confirm(`¿Eliminar la sala "${sala.nombre}"? Se eliminarán también sus butacas.`)) return;
    this.salaService.delete(sala.id).subscribe({ next: () => this.cargar() });
  }
}
