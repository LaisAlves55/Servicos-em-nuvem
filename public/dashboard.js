let grafico = null;

async function carregarDashboard() {

    const token = localStorage.getItem('token');

    if (!token) {
        alert('Faça login para acessar o Dashboard.');
        return;
    }

    try {

        const resposta = await fetch('/api/analytics/tokens', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert('Acesso permitido somente para administradores.');
            return;
        }

        if (!resposta.ok) {
            throw new Error('Erro ao buscar dados.');
        }

        const dados = await resposta.json();

        document.getElementById('totalTokens').textContent =
            dados.totalTokens.toLocaleString('pt-BR');

        document.getElementById('totalMensagens').textContent =
            dados.totalMensagens.toLocaleString('pt-BR');

        document.getElementById('totalUsuarios').textContent =
            dados.totalUsuarios.toLocaleString('pt-BR');

      criarGrafico(dados);

    } catch (erro) {

        console.error('Erro no Dashboard:', erro);

        alert('Não foi possível carregar os dados.');

    }
}

function criarGrafico(dados) {

    const contexto = document
        .getElementById('graficoTokens')
        .getContext('2d');

    const valores = [
        dados.totalTokens,
        dados.totalMensagens,
        dados.totalUsuarios
    ];

    if (grafico) {

        grafico.data.datasets[0].data = valores;
        grafico.update();

        return;
    }

    grafico = new Chart(contexto, {

        type: 'bar',

        data: {

            labels: [
                'Tokens consumidos',
                'Mensagens',
                'Usuários'
            ],

            datasets: [{

                label: 'Estatísticas do sistema',

                data: valores,

                backgroundColor: [
                    '#2563eb',
                    '#16a34a',
                    '#f59e0b'
                ],

                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {
                    beginAtZero: true
                }

            }

        }

    });

}
carregarDashboard();
