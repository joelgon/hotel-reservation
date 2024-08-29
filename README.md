# Hotel Reservation Service

Este repositório contém o serviço de reserva de hotel, implementado utilizando Serverless Framework e LocalStack para simulação dos serviços da AWS localmente.

## Pendências e Falhas nos Requisitos

- **Endpoint para Recebimento de Comprovantes de Pagamento/Depósito**:
  Não foi criado um endpoint específico para receber comprovantes de pagamento ou depósito. Se essa funcionalidade fosse implementada, provavelmente o documento não seria recebido diretamente pelo servidor back-end. Em vez disso, seria criado um endpoint que geraria uma URL pré-assinada de PUT. Essa URL seria utilizada pelo front-end para salvar o documento diretamente no S3, evitando o trânsito do arquivo pelo servidor back-end.

- **Desconto de Saldo no Check-in**:
  Descontar o saldo apenas no momento do check-in não parecia uma abordagem adequada, pois isso poderia gerar uma desvantagem significativa para o hotel. Clientes poderiam fazer reservas e não comparecer ou pagar, causando prejuízos ao hotel.


## Requisitos Mínimos

Para rodar este serviço localmente, você precisará garantir que os seguintes requisitos estejam atendidos:

### 1. AWS CLI v2

Você deve ter o AWS CLI v2 instalado. Se ainda não tiver instalado, siga as instruções [aqui](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) para a instalação.

### 2. Docker

O Docker deve estar instalado e rodando em sua máquina para que o LocalStack possa ser executado. Você pode instalar o Docker seguindo as instruções [aqui](https://docs.docker.com/get-docker/).

### 3. Serverless Framework (opcional)

O Serverless Framework deve estar instalado em sua máquina. Você pode instalar o Serverless Framework seguindo as instruções [aqui](https://www.serverless.com/framework/docs/getting-started).

### 4. Configuração do AWS CLI

Você precisará configurar o AWS CLI para que ele use o LocalStack em vez dos serviços reais da AWS.

1. **Arquivo `~/.aws/config`**

   Crie ou edite o arquivo `~/.aws/config` com o seguinte conteúdo:

   ```ini
   [default]
   region = us-east-1
   output = json
   endpoint_url = http://localhost:4566
   ```

2. **Arquivo `~/.aws/credentials`**

   Crie ou edite o arquivo `~/.aws/credentials` com o seguinte conteúdo:

   ```ini
   [default]
   aws_access_key_id = test
   aws_secret_access_key = test
   ```

### 5. Como Rodar o Serviço

Após garantir que todos os requisitos acima estão atendidos, siga os passos abaixo para rodar o serviço localmente:

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/joelgon/hotel-reservation.git
   cd hotel-reservation
   ```

2. **Instale as dependencias**

   ```bash
   npm i
   ```

3. **Suba o Ambiente Local com Docker Compose**

   ```bash
   docker-compose up
   ```

4. **Implante a Aplicação com Serverless**

   ```bash
   npm run deploy:local
   ```

5. **Acesse o Mongo Express (Opcional)**

  Se precisar acessar o MongoDB visualmente, você pode utilizar o Mongo Express acessando http://localhost:8081 no navegador.
  | Username | Password |
  | :------: | :------: |
  | mexpress | mexpress |

### Segue a collection completa
[![download](./download.png)][1]

### Como eu sei meu endpoint?

Após o deploy será gerada uma url conforme a imagem abaixo indica

![img\deploy_url_gerada.png](img\deploy_url_gerada.png)

[1]: https://github.com/joelgon/hotel-reservation/releases/download/1/hotel.reservation.postman_collection.json
