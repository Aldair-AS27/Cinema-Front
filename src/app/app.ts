import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <a routerLink="/" class="brand">
        <span class="brand-icon">🎬</span>
        <span class="brand-text">CINE<span class="brand-accent">POLIS</span></span>
      </a>

      <nav class="nav-links">
        <a routerLink="/peliculas"  routerLinkActive="active" [routerLinkActiveOptions]="{exact:false}">
          <span class="nav-icon">🎞️</span> Cartelera
        </a>
        <a routerLink="/funciones"  routerLinkActive="active" [routerLinkActiveOptions]="{exact:false}">
          <span class="nav-icon">🎟️</span> Funciones
        </a>
        <a routerLink="/salas"      routerLinkActive="active" [routerLinkActiveOptions]="{exact:false}">
          <span class="nav-icon">🎭</span> Salas
        </a>
        <a routerLink="/butacas"    routerLinkActive="active" [routerLinkActiveOptions]="{exact:false}">
          <span class="nav-icon">🪑</span> Butacas
        </a>
      </nav>
    </header>

    <main class="main-content">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-brand">🎬 CINEPOLIS</span>
        <span class="footer-sep">·</span>
        <span class="footer-copy">Sistema de Reservas © 2026</span>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* ── Navbar ── */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      height: 68px;
      background: rgba(10, 15, 30, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(201,168,76,0.2);
      box-shadow: 0 4px 32px rgba(0,0,0,0.5);
    }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
    }
    .brand-icon {
      font-size: 1.6rem;
      filter: drop-shadow(0 0 8px rgba(201,168,76,0.6));
    }
    .brand-text {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: 3px;
      color: var(--blue-100);
    }
    .brand-accent {
      color: var(--gold-400);
    }

    /* ── Nav Links ── */
    .nav-links {
      display: flex;
      gap: 0.25rem;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 1rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.3px;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all var(--transition);
    }

    .nav-links a:hover {
      color: var(--text-primary);
      background: var(--glass-md);
      border-color: var(--glass-bdr);
    }

    .nav-links a.active {
      color: var(--gold-400);
      background: rgba(201,168,76,0.08);
      border-color: rgba(201,168,76,0.25);
      box-shadow: 0 0 16px rgba(201,168,76,0.1);
    }

    .nav-icon {
      font-size: 1rem;
    }

    /* ── Main Content ── */
    .main-content {
      flex: 1;
    }

    /* ── Footer ── */
    .footer {
      padding: 1.25rem 2rem;
      background: rgba(3,7,18,0.8);
      border-top: 1px solid rgba(201,168,76,0.1);
    }
    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 0.8rem;
    }
    .footer-brand {
      color: var(--gold-500);
      font-weight: 700;
      letter-spacing: 2px;
    }
    .footer-sep { color: var(--text-muted); }
    .footer-copy { color: var(--text-muted); }

    @media (max-width: 640px) {
      .nav-links a span.nav-icon { display: none; }
      .brand-text { font-size: 1.1rem; letter-spacing: 2px; }
      .navbar { padding: 0 1rem; }
    }
  `],
})
export class App {}
