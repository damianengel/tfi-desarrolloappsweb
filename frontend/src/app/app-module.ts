import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import localeEsAr from '@angular/common/locales/es-AR';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';

import { Login } from './components/login/login';
import { Navbar } from './components/navbar/navbar';
import { ReservasPaciente } from './components/reservas-paciente/reservas-paciente';
import { AgendaMedico } from './components/agenda-medico/agenda-medico';
import { AdminPanel } from './components/admin-panel/admin-panel';

import { JwtInterceptor } from './interceptors/jwt-interceptor';

registerLocaleData(localeEsAr);

@NgModule({
  declarations: [
    AppComponent,
    Login,
    Navbar,
    ReservasPaciente,
    AgendaMedico,
    AdminPanel
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
