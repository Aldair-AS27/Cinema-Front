import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('debe crear la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe renderizar la navbar con la marca y los 4 enlaces principales', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-text')?.textContent).toContain('CINE');
    expect(compiled.querySelectorAll('.nav-links a').length).toBe(4);
    expect(compiled.querySelector('.footer-brand')?.textContent).toContain('CINEPOLIS');
  });
});
