export default class CorreiosErrorResult {
    CalcPrecoPrazoResult: {
        Servicos: {
            cServico: {
                Codigo: number;
                EntregaDomiciliar: string;
                EntregaSabado: string;
                Erro: string;
                MsgErro: string;
                PrazoEntrega: string;
                Valor: string;
                ValorAvisoRecebimento: string;
                ValorMaoPropria: string;
                ValorSemAdicionais: string;
                ValorValorDeclarado: string;
                obsFim: string;
            }[]
        }
    };
}
