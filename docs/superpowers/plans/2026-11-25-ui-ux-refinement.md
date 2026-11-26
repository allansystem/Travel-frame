# Plano de Implementação: Refinamento de UI/UX (Taste, Avoid-AI-Design, UI/UX Pro Max, Hallmark)

Este plano aplica os princípios de design dos quatro repositórios de referência ao **TravelFrame**, elevando o produto de uma estética genérica de painel feito por IA para uma experiência de galeria de arte digital e software de fotografia de alto nível.

---

## 1. Estrutura de Arquivos

- **Modificado:** `index.html` (Importação das fontes com identidade editorial e metadata).
- **Modificado:** `src/index.css` (Variáveis de design tokens, paleta quente de galeria, estilos de passe-partout e animações táteis).
- **Modificado:** `src/App.jsx` (Redesign das legendas cinematográficas no slideshow, atalhos de teclado de kiosk com modal `?`, drag-and-drop global na galeria e alinhamento dos componentes administrativos).
- **Modificado:** `server/server.js` (Suporte à nova opção de enquadramento `frameMatting` nos álbuns).

---

## 2. Tarefas de Implementação

### Tarefa 1: Fundações Visuais, Tipografia Editorial e Paleta de Cores
- [ ] Adicionar fontes no `index.html`: `Cormorant Garamond` (para títulos e placas de galeria) e `Plus Jakarta Sans` (para interface).
- [ ] Atualizar `src/index.css` com a nova paleta quente `#090a0c` / `#121418` / `#232730`, eliminando o preto puro e estilizando sombras e bordas físicas.
- [ ] Criar classe CSS para efeito *Passe-partout* (moldura de museu com borda de papel linho e sombra interna).
- [ ] Verificar build com `npm run build`.

### Tarefa 2: Atalhos de Teclado e Modo de Exibição no Slideshow (Kiosk)
- [ ] Implementar atalhos no `src/App.jsx`:
  - `Espaço`: Pausar / Retomar.
  - `Seta Direita` / `Seta Esquerda`: Próximo / Anterior.
  - `F`: Alternar tela cheia.
  - `I`: Alternar visibilidade das legendas/widgets.
  - `M`: Mutar / desmutar vídeos.
  - `?`: Abrir modal de ajuda de atalhos.
- [ ] Reestilizar a sobreposição de legenda do slide atual como uma "Placa de Galeria" elegante e discreta.
- [ ] Suportar a opção de moldura `passe-partout` na visualização de fotos.

### Tarefa 3: Redesign do Painel Administrativo e Drag & Drop Global
- [ ] Implementar drag-and-drop nativo arrastando fotos do computador diretamente sobre a aba de álbuns.
- [ ] Refinar o layout da barra lateral, botões de ação e lista de agendamentos para eliminar a repetição excessiva de caixas `rounded-2xl` empilhadas.
- [ ] Melhorar estados de foco acessíveis (`:focus-visible`) e micro-interações táteis nos botões (`active:scale-[0.98]`).

### Tarefa 4: Testes, Build e Deploy
- [ ] Executar `npm run build` e verificar integridade dos assets.
- [ ] Executar deploy automatizado no servidor de produção (`100.67.10.15`).
- [ ] Atualizar arquivo `/home/Allan/Downloads/travel-frame.zip`.
- [ ] Commitar alterações no Git e fazer push para `origin/main`.
