# Contribuindo para o ClinicOps

Obrigado por seu interesse em contribuir para o ClinicOps!

## Processo de Desenvolvimento

1. Faça um fork do repositório.
2. Crie uma nova branch para sua funcionalidade ou correção: `git checkout -b feature/minha-funcionalidade`.
3. Certifique-se de que os testes estão passando: `npm test`.
4. Faça o commit de suas alterações seguindo o padrão de [Conventional Commits](https://www.conventionalcommits.org/).
5. Envie sua branch para o repositório remoto: `git push origin feature/minha-funcionalidade`.
6. Abra um Pull Request.

## Testes

Todas as novas funcionalidades devem ser acompanhadas de testes unitários ou e2e.

- Testes unitários de componentes devem ser colocados em arquivos `.test.tsx` ao lado do componente.
- Testes E2E devem ser colocados no diretório `e2e/`.

## Estilo de Código

Este projeto utiliza ESLint para garantir a consistência do código. Por favor, execute `npm run lint` antes de realizar o commit.
