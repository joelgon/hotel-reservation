# Hotel Reservation Service

Este repositório contém o serviço de reserva de hotel, implementado utilizando Serverless Framework e LocalStack para simulação dos serviços da AWS localmente.

## Requisitos Mínimos

Para rodar este serviço localmente, você precisará garantir que os seguintes requisitos estejam atendidos:

### 1. AWS CLI v2

Você deve ter o AWS CLI v2 instalado. Se ainda não tiver instalado, siga as instruções [aqui](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) para a instalação.

### 2. Docker

O Docker deve estar instalado e rodando em sua máquina para que o LocalStack possa ser executado. Você pode instalar o Docker seguindo as instruções [aqui](https://docs.docker.com/get-docker/).

### 3. Serverless Framework

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
   serverless deploy --stage local
   ```

5. **Acesse o Mongo Express (Opcional)**
   
   Se precisar acessar o MongoDB visualmente, você pode utilizar o Mongo Express acessando http://localhost:8081 no navegador.
   | Username | Password |
   |:--------:|:--------:|
   | mexpress | mexpress |