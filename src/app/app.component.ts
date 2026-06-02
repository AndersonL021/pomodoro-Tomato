import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  titulo = 'pomodoro.';
  tagline = 'foco, pausa e produtividade';
  horarioAtual = new Date();
  alarmeAtivo = false;
  rodadas = [0];
  segundos = 1500;
  relogioAtivo = false;
  readonly sessoesPorRodada = 4;
  readonly duracaoSessao = 1500;
  private relogioIntervaloId: number | null = null;
  private horarioAtualIntervaloId: number | null = null;

  @ViewChild('audio', { static: true })
  referenciaAudio!: ElementRef<HTMLAudioElement>;

  ngOnInit(): void {
    this.horarioAtualIntervaloId = window.setInterval(() => {
      this.horarioAtual = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.horarioAtualIntervaloId !== null) {
      clearInterval(this.horarioAtualIntervaloId);
    }
    this.limparRelogio();
  }

  get minutos(): number {
    return Math.floor(this.segundos / 60);
  }

  get segundosRestantes(): number {
    return this.segundos % 60;
  }

  get tempoRestante(): string {
    const min = this.minutos;
    const sec = this.segundosRestantes;
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  }

  get dataFormatada(): string {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${dias[this.horarioAtual.getDay()]}, ${this.horarioAtual.getDate()} de ${meses[this.horarioAtual.getMonth()]}`;
  }

  get horaFormatada(): string {
    return this.horarioAtual.toLocaleString('pt-BR', { timeStyle: 'short' });
  }

  get sessoesConcluidasNaRodada(): number {
    return this.rodadas[this.rodadas.length - 1];
  }

  get sessaoAtualNumero(): number {
    return Math.min(this.sessoesConcluidasNaRodada + 1, this.sessoesPorRodada);
  }

  get sessoes(): number[] {
    return Array.from({ length: this.sessoesPorRodada }, (_, i) => i);
  }

  get progressoGraus(): number {
    return ((this.duracaoSessao - this.segundos) / this.duracaoSessao) * 360;
  }

  get statusTexto(): string {
    if (this.alarmeAtivo) return 'Hora da pausa';
    if (this.relogioAtivo) return 'Foco ativo';
    if (this.segundos < this.duracaoSessao) return 'Sessão pausada';
    return 'Pronto para iniciar';
  }

  get proximaPausaMinutos(): number {
    const aposEstaSessao = this.sessoesConcluidasNaRodada + 1;
    return aposEstaSessao === this.sessoesPorRodada ? 15 : 5;
  }

  alternarRelogio(): void {
    if (this.relogioAtivo) {
      this.relogioAtivo = false;
      this.limparRelogio();
      return;
    }

    this.relogioAtivo = true;
    this.iniciarRelogio();
  }

  reiniciarRelogio(): void {
    this.relogioAtivo = false;
    this.segundos = 1500;
    this.limparRelogio();
  }

  pararAlarme(): void {
    if (this.referenciaAudio?.nativeElement) {
      this.referenciaAudio.nativeElement.pause();
      this.referenciaAudio.nativeElement.currentTime = 0;
    }
    this.alarmeAtivo = false;
  }

  testarAlarme(): void {
    this.tocarAlarme();
  }

  criarArray(length: number): number[] {
    return Array.from({ length }, (_, index) => index);
  }

  private iniciarRelogio(): void {
    this.limparRelogio();

    this.relogioIntervaloId = window.setInterval(() => {
      if (this.segundos > 0) {
        this.segundos -= 1;
      }

      if (this.segundos === 0) {
        this.atualizarRodadas();
        this.tocarAlarme();
        this.reiniciarRelogio();
      }
    }, 1000);
  }

  private limparRelogio(): void {
    if (this.relogioIntervaloId !== null) {
      clearInterval(this.relogioIntervaloId);
      this.relogioIntervaloId = null;
    }
  }

  private atualizarRodadas(): void {
    const rodadasAtualizadas = [...this.rodadas];

    if (rodadasAtualizadas[rodadasAtualizadas.length - 1] === 4) {
      rodadasAtualizadas.push(1);
    } else {
      rodadasAtualizadas[rodadasAtualizadas.length - 1] += 1;
    }

    this.rodadas = rodadasAtualizadas;
  }

  private readonly volumeAlarme = 0.3;

  private tocarAlarme(): void {
    if (this.referenciaAudio?.nativeElement) {
      this.referenciaAudio.nativeElement.volume = this.volumeAlarme;
      this.referenciaAudio.nativeElement.play();
      this.alarmeAtivo = true;
    }
  }
}
