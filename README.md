# Desenvolver e testar

- Use o projeto de exemplo de um web app [https://gitlab.com/squid-webapps/web-app]()
- Inicialize os submodules `git submodule init`
- Atualize e baixe os submodules `git submodule update`
- Navegue até a pasta do core `cd app/bower_components/squid-web-app-core`
- Instale as dependencias do server `npm install`
- Instale as dependencias do client `bower install`
- Deixe o gulp rodando para gerar os bundles enquanto você desenvolve `gulp`
- Abra outra janela do terminal na raíz do projeto `web-app`
- Inicie a aplicação do web-app `npm run start-dev`

# Publicar uma nova versão
- Abrir o arquivo `bower.json` e `package.json` e atualizar a propriedade `version`
- `git tag -a v1.0.0 -m "Release version 1.0.0"`
- `git push origin master --tags`