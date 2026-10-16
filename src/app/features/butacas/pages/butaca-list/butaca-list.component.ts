import { Component, inject, OnInit, signal } from '@angular/core';

import { ButacaService } from '@core/services';
import { Butaca } from '@core/models';

/**
 * Página de listado de todas las butacas (vista de administración).
 */
@Component({
  selector: 'app-butaca-list',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <p class="hero-label">Administración</p>
          <h1 class="hero-title">Inventario de <span class="gold">butacas</span></h1>
          <p class="hero-sub">{{ butacas().length }} butacas registradas en todas las salas</p>
        </div>
      </section>

      <section class="content">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando butacas...</p>
          </div>
        }

        @if (!loading()) {
          <div class="table-wrap fade-in">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th><th>Sala</th><th>Fila</th><th>Número</th><th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                @for (b of butacas(); track b.id) {
                  <tr>
                    <td class="mono">{{ b.id }}</td>
                    <td>{{ b.sala_id }}</td>
                    <td class="fila">{{ b.fila }}</td>
                    <td>{{ b.numero }}</td>
                    <td><span class="badge" [class]="b.tipo">{{ b.tipo }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
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
      padding: 3rem 2rem 2.5rem;
      border-bottom: 1px solid var(--glass-bdr);
    }
    .hero-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 10% 30%, rgba(45,106,159,0.1) 0%, transparent 50%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--gold-500); margin-bottom: 0.5rem; }
    .hero-title { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; margin-bottom: 0.5rem; }
    .gold { color: var(--gold-400); }
    .hero-sub { color: var(--text-secondary); font-size: 0.9rem; }

    .content { padding: 2rem; max-width: 1100px; margin: 0 auto; }

    /* Tabla */
    .table-wrap {
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .table th {
      text-align: left;
      padding: 0.9rem 1.25rem;
      font-size: 0.72rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      color: var(--gold-500);
      background: rgba(201,168,76,0.05);
      border-bottom: 1px solid var(--glass-bdr);
    }
    .table td {
      padding: 0.7rem 1.25rem;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .table tbody tr { transition: background var(--transition); }
    .table tbody tr:hover { background: var(--glass-md); }
    .table tbody tr:last-child td { border-bottom: none; }

    .mono { font-family: ui-monospace, 'Cascadia Code', monospace; font-size: 0.78rem; color: var(--text-muted); }
    .fila { font-weight: 800; color: var(--gold-400); }

    .badge {
      padding: 0.2rem 0.65rem;
      border-radius: 99px;
      font-size: 0.72rem; font-weight: 700;
      text-transform: capitalize;
    }
    .badge.regular { background: rgba(45,106,159,0.15); border: 1px solid rgba(45,106,159,0.3); color: var(--blue-200); }
    .badge.vip { background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); color: var(--gold-400); }
    .badge.discapacitados { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }

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
  `],
})
export class ButacaListComponent implements OnInit {
  private readonly butacaService = inject(ButacaService);

  readonly butacas = signal<Butaca[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.butacaService.getAll().subscribe({
      next: (data) => { this.butacas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
