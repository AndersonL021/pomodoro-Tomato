import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  titulo = 'pomodoro.';
  horarioAtual = new Date();
  alarmeAtivo = false;
  menuAberto = false;
  anotacoesAbertas = false;
  textoAnotacoes = '';
  fundoImagem = '';
  rodadas = [0];
  segundos = 1500;
  relogioAtivo = false;
  indiceCitacao = 0;
  modoAtual: 'pomodoro' | 'descanso' | 'longo' = 'pomodoro';
  contadorPomodoros = 0;
  contadorDescansos = 0;
  contadorDescansosLongos = 0;
  readonly sessoesPorRodada = 4;
  private relogioIntervaloId: number | null = null;
  private horarioAtualIntervaloId: number | null = null;

  private readonly duracoes = {
    pomodoro: 25 * 60,
    descanso: 5 * 60,
    longo: 20 * 60,
  } as const;

  readonly citacoes = [
    /*'Mergulhe. No aprendizado e na lembrança.',
    'Experiência é o nome que damos aos nossos erros.',
    'As respostas estão na orientação da graça',
    'A persistência é o caminho do êxito.',
    'O foco é a arte de saber o que ignorar.',
    'O chamado da graça há muito tempo perdida fala com todos nós.',
    'Grandes feitos exigem grande determinação.',
    'Cada sessão é um passo em direção à maestria.',
    */'Dive. Into learning and remembrance.',
    'Experience is the name we give our mistakes.',
    'The answers lie in the guidance of grace.',
    'Persistence is the path to success.',
    'Focus is the art of knowing what to ignore.',
    'The long-lost call of grace speaks to us all.',
    'Great deeds require great determination.',
    'Each session is a step toward mastery.',
  ];

  @ViewChild('audio', { static: true })
  referenciaAudio!: ElementRef<HTMLAudioElement>;

  ngOnInit(): void {
    const base = document.querySelector('base')?.href ?? '/';
    this.fundoImagem = `${base}elden2.jpg`;

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

  get citacaoAtual(): string {
    return this.citacoes[this.indiceCitacao];
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

  get duracaoAtual(): number {
    return this.duracoes[this.modoAtual];
  }

  get totalPomodoros(): number {
    return this.contadorPomodoros;
  }

  get totalDescansos(): number {
    return this.contadorDescansos;
  }

  get totalDescansosLongos(): number {
    return this.contadorDescansosLongos;
  }

  get statusTexto(): string {
    if (this.alarmeAtivo) {
      if (this.modoAtual === 'pomodoro') return 'Hora da pausa';
      return 'Tempo esgotado';
    }
    if (this.relogioAtivo) {
      if (this.modoAtual === 'pomodoro') return 'Foco ativo';
      if (this.modoAtual === 'descanso') return 'Descanso ativo';
      return 'Descanso longo ativo';
    }
    if (this.segundos < this.duracaoAtual) return 'Sessão pausada';
    return 'Pronto para iniciar';
  }

  get proximaPausaMinutos(): number {
    const aposEstaSessao = this.sessoesConcluidasNaRodada + 1;
    return aposEstaSessao === this.sessoesPorRodada ? 20 : 5;
  }

  get mensagemAlarme(): string {
    if (this.modoAtual === 'pomodoro') return 'Fim da sessão de foco!';
    if (this.modoAtual === 'descanso') return 'Fim do descanso curto!';
    return 'Fim do descanso longo!';
  }

  get textoSessao(): string {
    if (this.modoAtual === 'pomodoro') {
      return `Sessão ${this.sessaoAtualNumero} de ${this.sessoesPorRodada} • Foco por 25 min`;
    }
    if (this.modoAtual === 'descanso') {
      return 'Descanso curto • 5 min';
    }
    return 'Descanso longo • 20 min';
  }

  get textoBotaoPrincipal(): string {
    return this.relogioAtivo ? 'PAUSAR SESSÃO' : 'INICIAR SESSÃO';
  }

  selecionarModo(modo: 'pomodoro' | 'descanso' | 'longo'): void {
    this.relogioAtivo = false;
    this.limparRelogio();
    this.modoAtual = modo;
    this.segundos = this.duracaoAtual;
    this.alarmeAtivo = false;
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu(): void {
    this.menuAberto = false;
  }

  proximaCitacao(): void {
    this.indiceCitacao = (this.indiceCitacao + 1) % this.citacoes.length;
  }

  alternarAnotacoes(): void {
    this.anotacoesAbertas = !this.anotacoesAbertas;
  }

  atualizarAnotacoes(evento: Event): void {
    this.textoAnotacoes = (evento.target as HTMLTextAreaElement).value;
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
    this.segundos = this.duracaoAtual;
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
        this.registrarConclusao();
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

  private registrarConclusao(): void {
    switch (this.modoAtual) {
      case 'pomodoro':
        this.contadorPomodoros += 1;
        this.atualizarRodadas();
        break;
      case 'descanso':
        this.contadorDescansos += 1;
        break;
      case 'longo':
        this.contadorDescansosLongos += 1;
        break;
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

  private readonly volumeAlarme = 1;

  private tocarAlarme(): void {
    if (this.referenciaAudio?.nativeElement) {
      this.referenciaAudio.nativeElement.volume = this.volumeAlarme;
      this.referenciaAudio.nativeElement.play();
      this.alarmeAtivo = true;
    }
  }
}
