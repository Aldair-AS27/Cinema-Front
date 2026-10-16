import { Component, inject, Input, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FuncionButacaService, FuncionHorarioService } from '@core/services';
import { FuncionButaca, FuncionHorario, EstadoButaca } from '@core/models';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="seatmap-page">

      <!-- Barra superior -->
      <header class="seatmap-header">
        <a routerLink="/funciones" class="btn-back">← Volver</a>
        @if (funcion()) {
          <div class="header-info">
            <h1 class="header-titulo">{{ funcion()!.pelicula?.titulo }}</h1>
            <div class="header-meta">
              <span class="meta-pill">📅 {{ funcion()!.fecha }}</span>
              <span class="meta-pill">⏰ {{ funcion()!.hora_inicio }}</span>
              <span class="meta-pill blue">🎭 {{ funcion()!.sala?.nombre }}</span>
              <span class="meta-pill gold">{{ funcion()!.sala?.tipo }}</span>
            </div>
          </div>
        }
      </header>

      <div class="seatmap-body">
        <!-- Área de asientos -->
        <div class="theater">

          <!-- Pantalla -->
          <div class="screen-wrap">
            <div class="screen"></div>
            <p class="screen-label">P A N T A L L A</p>
          </div>

          <!-- Leyenda -->
          <div class="leyenda">
            <div class="leyenda-item disponible"><span class="dot"></span> Disponible</div>
            <div class="leyenda-item seleccionada"><span class="dot"></span> Seleccionado</div>
            <div class="leyenda-item ocupada"><span class="dot"></span> Ocupado</div>
            <div class="leyenda-item reservada"><span class="dot"></span> Reservado</div>
            <div class="leyenda-item bloqueada"><span class="dot"></span> Bloqueado</div>
          </div>

          <!-- Mapa de asientos -->
          @if (loading()) {
            <div class="loading-seats">
              <div class="spinner"></div>
              <p>Cargando mapa de sala...</p>
            </div>
          } @else {
            <div class="filas-wrapper">
              @for (fila of filas(); track fila) {
                <div class="fila">
                  <span class="fila-label">{{ fila }}</span>
                  <div class="fila-seats">
                    @for (fb of getButacasDeFila(fila); track fb.id) {
                      <button
                        class="seat"
                        [class]="getSeatClass(fb)"
                        [disabled]="!isSeleccionable(fb.estado)"
                        (click)="toggleSeleccion(fb)"
                        [title]="getTooltip(fb)">
                        <span class="seat-num">{{ fb.butaca?.numero }}</span>
                        @if (fb.butaca?.tipo === 'vip') { <span class="seat-vip-dot"></span> }
                      </button>
                    }
                  </div>
                  <span class="fila-label">{{ fila }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Panel lateral de resumen -->
        <aside class="summary-panel" [class.active]="seleccionadas().length > 0">
          <div class="summary-inner">
            <h2 class="summary-title">🛒 Mi selección</h2>

            @if (seleccionadas().length === 0) {
              <p class="summary-empty">Selecciona asientos<br/>en el mapa</p>
            } @else {
              <ul class="summary-list">
                @for (fb of seleccionadas(); track fb.id) {
                  <li class="summary-item">
                    <span class="item-seat">
                      {{ fb.butaca?.fila }}{{ fb.butaca?.numero }}
                      @if (fb.butaca?.tipo === 'vip') { <span class="vip-badge">VIP</span> }
                    </span>
                    <span class="item-price">S/ {{ getPrecio(fb) | number:'1.2-2' }}</span>
                  </li>
                }
              </ul>

              <div class="summary-total">
                <span>Total</span>
                <span class="total-amount">S/ {{ total() | number:'1.2-2' }}</span>
              </div>

              <button class="btn-confirmar" (click)="confirmarSeleccion()" [disabled]="confirmando()">
                @if (confirmando()) { ⏳ Reservando... } @else { ✅ Confirmar reserva }
              </button>

              @if (mensaje()) {
                <p class="mensaje-ok fade-in">{{ mensaje() }}</p>
              }
            }

            <!-- Estadísticas de sala -->
            <div class="summary-stats">
              <div class="stat">
                <span class="stat-val green">{{ disponiblesCount() }}</span>
                <span class="stat-label">disponibles</span>
              </div>
              <div class="stat">
                <span class="stat-val red">{{ ocupadosCount() }}</span>
                <span class="stat-label">ocupados</span>
              </div>
              <div class="stat">
                <span class="stat-val gold">{{ seleccionadas().length }}</span>
                <span class="stat-label">seleccionados</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .seatmap-page { min-height: 100vh; background: var(--blue-900); display: flex; flex-direction: column; }

    /* Header */
    .seatmap-header {
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

    /* Body */
    .seatmap-body {
      display: flex; flex: 1;
      gap: 0;
    }

    /* Theater */
    .theater {
      flex: 1;
      padding: 2rem;
      overflow-x: auto;
      display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
    }

    /* Pantalla */
    .screen-wrap { width: 100%; max-width: 600px; text-align: center; }
    .screen {
      height: 8px;
      background: linear-gradient(90deg, transparent, var(--gold-500), var(--gold-300), var(--gold-500), transparent);
      border-radius: 99px;
      box-shadow: 0 0 20px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2);
      margin-bottom: 0.5rem;
    }
    .screen-label {
      font-size: 0.65rem; letter-spacing: 5px;
      color: var(--gold-600); font-weight: 700;
    }

    /* Leyenda */
    .leyenda {
      display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
      padding: 0.75rem 1.5rem;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-xl);
    }
    .leyenda-item {
      display: flex; align-items: center; gap: 0.4rem;
      font-size: 0.75rem; color: var(--text-secondary);
    }
    .dot {
      width: 12px; height: 12px; border-radius: 3px;
      border: 1px solid;
    }
    .disponible .dot  { background: var(--seat-available); border-color: var(--seat-available-bdr); }
    .seleccionada .dot { background: var(--seat-selected); border-color: var(--seat-selected-bdr); }
    .ocupada .dot     { background: var(--seat-occupied); border-color: var(--seat-occupied-bdr); }
    .reservada .dot   { background: var(--seat-reserved); border-color: var(--seat-reserved-bdr); }
    .bloqueada .dot   { background: var(--seat-blocked); border-color: var(--seat-blocked-bdr); }

    /* Filas */
    .filas-wrapper { display: flex; flex-direction: column; gap: 0.35rem; }
    .fila { display: flex; align-items: center; gap: 0.5rem; }
    .fila-label {
      width: 22px; text-align: center;
      font-size: 0.72rem; font-weight: 700;
      color: var(--text-muted);
    }
    .fila-seats { display: flex; gap: 0.3rem; }

    /* Asiento */
    .seat {
      width: 32px; height: 32px;
      border-radius: 6px 6px 4px 4px;
      border: 1px solid;
      cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      position: relative;
      transition: all var(--transition);
    }
    .seat:hover:not(:disabled) { transform: scale(1.15); z-index: 2; }
    .seat:disabled { cursor: not-allowed; }

    .seat-num { font-size: 0.6rem; font-weight: 700; line-height: 1; }
    .seat-vip-dot {
      position: absolute; top: 2px; right: 2px;
      width: 4px; height: 4px; border-radius: 50%;
      background: var(--gold-400);
    }

    /* Estados de asientos */
    .seat.disponible  { background: var(--seat-available); border-color: var(--seat-available-bdr); color: #86efac; }
    .seat.seleccionada { background: var(--seat-selected); border-color: var(--seat-selected-bdr); color: #fcd34d; box-shadow: 0 0 12px rgba(245,158,11,0.4); animation: pulse-gold 1.5s infinite; }
    .seat.ocupada     { background: var(--seat-occupied); border-color: var(--seat-occupied-bdr); color: #fca5a5; }
    .seat.reservada   { background: var(--seat-reserved); border-color: var(--seat-reserved-bdr); color: #fdba74; }
    .seat.bloqueada   { background: var(--seat-blocked); border-color: var(--seat-blocked-bdr); color: var(--text-muted); }

    /* Panel resumen */
    .summary-panel {
      width: 280px; flex-shrink: 0;
      background: rgba(3,7,18,0.7);
      backdrop-filter: blur(16px);
      border-left: 1px solid var(--glass-bdr);
      padding: 1.5rem;
      display: flex; flex-direction: column;
    }
    .summary-inner { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
    .summary-title { font-size: 1rem; font-weight: 700; color: var(--text-gold); letter-spacing: 0.5px; }
    .summary-empty { color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem 0; line-height: 1.6; }

    .summary-list { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
    .summary-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.4rem 0.75rem;
      background: var(--glass);
      border: 1px solid var(--glass-bdr);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
    }
    .item-seat { font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem; }
    .vip-badge {
      background: rgba(201,168,76,0.15);
      border: 1px solid rgba(201,168,76,0.3);
      color: var(--gold-400);
      font-size: 0.6rem; font-weight: 800; letter-spacing: 1px;
      padding: 0.1rem 0.35rem; border-radius: 3px;
    }
    .item-price { color: var(--gold-400); font-weight: 700; font-size: 0.85rem; }

    .summary-total {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem;
      background: rgba(201,168,76,0.08);
      border: 1px solid rgba(201,168,76,0.2);
      border-radius: var(--radius-sm);
      font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);
    }
    .total-amount { font-size: 1.3rem; font-weight: 800; color: var(--gold-400); }

    .btn-confirmar {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, var(--gold-600), var(--gold-500));
      color: var(--blue-950);
      font-weight: 800; font-size: 0.9rem; letter-spacing: 0.5px;
      border: none; border-radius: var(--radius-sm);
      cursor: pointer;
      box-shadow: var(--glow-gold);
      transition: all var(--transition);
    }
    .btn-confirmar:hover {
      background: linear-gradient(135deg, var(--gold-500), var(--gold-300));
      box-shadow: 0 0 28px rgba(201,168,76,0.5);
      transform: translateY(-2px);
    }
    .btn-confirmar:disabled { opacity: 0.6; cursor: wait; box-shadow: none; transform: none; }

    .mensaje-ok {
      font-size: 0.8rem; font-weight: 600;
      color: #4ade80;
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.25);
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.75rem;
      text-align: center;
    }

    /* Estadísticas */
    .summary-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--glass-bdr);
    }
    .stat { text-align: center; }
    .stat-val { display: block; font-size: 1.3rem; font-weight: 800; }
    .stat-val.green { color: #4ade80; }
    .stat-val.red   { color: #f87171; }
    .stat-val.gold  { color: var(--gold-400); }
    .stat-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    /* Loading */
    .loading-seats {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 3rem; color: var(--text-secondary);
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--blue-700);
      border-top-color: var(--gold-500);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .seatmap-body { flex-direction: column; }
      .summary-panel { width: 100%; border-left: none; border-top: 1px solid var(--glass-bdr); }
      .seat { width: 28px; height: 28px; }
    }
  `],
})
export class SeatMapComponent implements OnInit {
  @Input() funcionId!: string;

  private readonly funcionButacaService = inject(FuncionButacaService);
  private readonly funcionHorarioService = inject(FuncionHorarioService);

  readonly funcion = signal<FuncionHorario | null>(null);
  readonly mapaButacas = signal<FuncionButaca[]>([]);
  readonly loading = signal(true);
  readonly confirmando = signal(false);
  readonly mensaje = signal<string | null>(null);
  private readonly seleccionadasIds = signal<Set<string>>(new Set());

  readonly seleccionadas = computed(() =>
    this.mapaButacas().filter((fb) => this.seleccionadasIds().has(fb.id))
  );
  readonly total = computed(() =>
    this.seleccionadas().reduce((acc, fb) => acc + this.getPrecio(fb), 0)
  );
  readonly filas = computed(() => {
    const set = new Set(this.mapaButacas().map((fb) => fb.butaca?.fila ?? ''));
    return Array.from(set).filter(Boolean).sort();
  });
  readonly disponiblesCount = computed(() =>
    this.mapaButacas().filter((fb) => fb.estado === 'disponible' && !this.seleccionadasIds().has(fb.id)).length
  );
  readonly ocupadosCount = computed(() =>
    this.mapaButacas().filter((fb) => fb.estado === 'ocupada' || fb.estado === 'reservada').length
  );

  ngOnInit(): void {
    this.funcionHorarioService.getById(this.funcionId).subscribe({ next: (f) => this.funcion.set(f) });
    this.funcionButacaService.getByFuncion(this.funcionId).subscribe({
      next: (data) => { this.mapaButacas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getButacasDeFila(fila: string): FuncionButaca[] {
    return this.mapaButacas()
      .filter((fb) => fb.butaca?.fila === fila)
      .sort((a, b) => (a.butaca?.numero ?? 0) - (b.butaca?.numero ?? 0));
  }

  isSeleccionable(estado: EstadoButaca): boolean {
    return estado === 'disponible';
  }

  getSeatClass(fb: FuncionButaca): string {
    if (this.seleccionadasIds().has(fb.id)) return 'seleccionada';
    return fb.estado;
  }

  getTooltip(fb: FuncionButaca): string {
    const pos = `${fb.butaca?.fila ?? ''}${fb.butaca?.numero ?? ''}`;
    const tipo = fb.butaca?.tipo ?? '';
    const precio = this.getPrecio(fb);
    return `${pos} · ${tipo} · S/ ${precio} · ${fb.estado}`;
  }

  getPrecio(fb: FuncionButaca): number {
    return fb.precio ?? this.funcion()?.precio ?? 0;
  }

  toggleSeleccion(fb: FuncionButaca): void {
    if (!this.isSeleccionable(fb.estado)) return;
    const current = new Set(this.seleccionadasIds());
    current.has(fb.id) ? current.delete(fb.id) : current.add(fb.id);
    this.seleccionadasIds.set(current);
    this.mensaje.set(null);
  }

  /**
   * Confirma la reserva: persiste el estado 'reservada' de cada butaca
   * seleccionada (vía mock o backend real) y refresca el mapa local.
   */
  confirmarSeleccion(): void {
    const seleccionadas = this.seleccionadas();
    if (seleccionadas.length === 0) return;

    const totalTexto = this.total().toFixed(2);
    this.confirmando.set(true);
    this.mensaje.set(null);

    forkJoin(
      seleccionadas.map((fb) => this.funcionButacaService.update(fb.id, { estado: 'reservada' }))
    ).subscribe({
      next: (actualizadas) => {
        const ids = new Set(actualizadas.map((a) => a.id));
        this.mapaButacas.update((lista) =>
          lista.map((fb) =>
            ids.has(fb.id) ? { ...fb, estado: 'reservada' as EstadoButaca } : fb
          )
        );
        this.seleccionadasIds.set(new Set());
        this.confirmando.set(false);
        this.mensaje.set(
          `✅ Reserva confirmada: ${seleccionadas.length} asiento(s) · Total: S/ ${totalTexto}`
        );
      },
      error: () => {
        this.confirmando.set(false);
        this.mensaje.set('⚠️ No se pudo confirmar la reserva. Intenta de nuevo.');
      },
    });
  }
}
