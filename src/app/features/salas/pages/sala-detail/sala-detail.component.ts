import { Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SalaService, ButacaService } from '@core/services';
import { Sala, Butaca } from '@core/models';

/**
 * Página de detalle de sala: info de la sala y disposición de sus butacas,
 * agrupadas por fila como en un cine real.
 */
@Component({
  selector: 'app-sala-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <!-- Header -->
      <header class="detail-header">
        <a routerLink="/salas" class="btn-back">← Volver</a>
        @if (sala()) {
          <div class="header-info">
            <h1 class="header-titulo">{{ sala()!.nombre }}</h1>
            <div class="header-meta">
              <span class="meta-pill blue">🎭 {{ sala()!.tipo }}</span>
              <span class="meta-pill gold">🪑 {{ sala()!.capacidad }} asientos</span>
              <span class="meta-pill">{{ butacas().length }} butacas registradas</span>
            </div>
          </div>
          <a [routerLink]="['/salas', sala()!.id, 'editar']" class="btn-edit">✏️ Editar sala</a>
        }
      </header>

      <section class="content">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando sala...</p>
          </div>
        }

        @if (!loading()) {
          <!-- Pantalla -->
          <div class="screen-wrap">
            <div class="screen"></div>
            <p class="screen-label">P A N T A L L A</p>
          </div>

          <!-- Leyenda -->
          <div class="leyenda">
            <div class="leyenda-item"><span class="dot regular"></span> Regular</div>
            <div class="leyenda-item"><span class="dot vip"></span> VIP</div>
            <div class="leyenda-item"><span class="dot discapacitados"></span> Accesible</div>
          </div>

          <!-- Butacas por fila -->
          <div class="filas-wrapper fade-in">
            @for (fila of filas(); track fila) {
              <div class="fila">
                <span class="fila-label">{{ fila }}</span>
                <div class="fila-butacas">
                  @for (butaca of butacasDeFila(fila); track butaca.id) {
                    <div class="butaca" [class]="butaca.tipo" [title]="butaca.fila + butaca.numero + ' · ' + butaca.tipo">
                      {{ butaca.numero }}
                    </div>
                  }
                </div>
                <span class="fila-label">{{ fila }}</span>
              </div>
            }

            @if (butacas().length === 0) {
              <div class="empty-state">
                <span>🪑</span>
                <p>Esta sala no tiene butacas registradas</p>
              </div>
            }
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
    .content {
      max-width: 900px; margin: 0 auto;
      padding: 2.5rem 2rem;
      display: flex; flex-direction: column; align-items: center; gap: 1.75rem;
    }

    /* Pantalla */
    .screen-wrap { width: 100%; max-width: 520px; text-align: center; }
    .screen {
      height: 8px;
      background: linear-gradient(90deg, transparent, var(--gold-500), var(--gold-300), var(--gold-500), transparent);
      border-radius: 99px;
      box-shadow: 0 0 20px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2);
      margin-bottom: 0.5rem;
    }
    .screen-label { font-size: 0.65rem; letter-spacing: 5px; color: var(--gold-600); font-weight: 700; }

    /* Leyenda */
    .leyenda {
      display: flex; gap: 1.25rem; flex-wrap: wrap; justify-content: center;
      padding: 0.75rem 1.5rem;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-xl);
    }
    .leyenda-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-secondary); }
    .dot { width: 12px; height: 12px; border-radius: 3px; border: 1px solid; }
    .dot.regular { background: rgba(45,106,159,0.25); border-color: var(--blue-400); }
    .dot.vip { background: rgba(201,168,76,0.2); border-color: var(--gold-500); }
    .dot.discapacitados { background: rgba(34,197,94,0.12); border-color: #22c55e; }

    /* Filas */
    .filas-wrapper { display: flex; flex-direction: column; gap: 0.4rem; }
    .fila { display: flex; align-items: center; gap: 0.6rem; }
    .fila-label {
      width: 20px; text-align: center;
      font-size: 0.72rem; font-weight: 700;
      color: var(--text-muted);
    }
    .fila-butacas { display: flex; gap: 0.35rem; flex-wrap: wrap; }

    .butaca {
      width: 34px; height: 34px;
      border-radius: 6px 6px 4px 4px;
      border: 1px solid;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 700;
      transition: all var(--transition);
    }
    .butaca:hover { transform: scale(1.12); }
    .butaca.regular { background: rgba(45,106,159,0.18); border-color: var(--blue-400); color: var(--blue-200); }
    .butaca.vip { background: rgba(201,168,76,0.18); border-color: var(--gold-500); color: var(--gold-300); }
    .butaca.discapacitados { background: rgba(34,197,94,0.12); border-color: #22c55e; color: #86efac; }

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
      text-align: center; padding: 3rem;
      color: var(--text-muted);
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
    }
    .empty-state span { font-size: 2.5rem; }
  `],
})
export class SalaDetailComponent implements OnInit {
  @Input() id!: string;

  private readonly salaService = inject(SalaService);
  private readonly butacaService = inject(ButacaService);

  readonly sala = signal<Sala | null>(null);
  readonly butacas = signal<Butaca[]>([]);
  readonly loading = signal(true);

  readonly filas = computed(() => {
    const set = new Set(this.butacas().map((b) => b.fila));
    return Array.from(set).sort();
  });

  ngOnInit(): void {
    this.salaService.getById(this.id).subscribe({
      next: (s) => this.sala.set(s),
      error: () => this.loading.set(false),
    });
    this.butacaService.getBySala(this.id).subscribe({
      next: (b) => { this.butacas.set(b); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  butacasDeFila(fila: string): Butaca[] {
    return this.butacas()
      .filter((b) => b.fila === fila)
      .sort((a, b) => a.numero - b.numero);
  }
}
