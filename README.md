# Desenvolver e testar

- Use o projeto de exemplo de um web app [https://gitlab.com/squid-webapps/web-app]()
- `git submodule init`
- `git submodule update`
- `cd app/bower_components/squid-web-app-core`
- `npm install`
- `bower install`
- `gulp`
- Abra outra janela do terminal e navegue até a raíz do projeto
- `npm run start-dev`

# Publicar uma nova versão
- Abrir o arquivo `bower.json` e `package.json` e atualizar a propriedade `version`
- `git tag -a v1.0.0 -m "Release version 1.0.0"`
- `git push origin master --tags`