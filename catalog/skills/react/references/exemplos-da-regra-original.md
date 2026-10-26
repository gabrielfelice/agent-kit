# Regras para React

Estas regras se aplicam a componentes, hooks e módulos de acesso a dados em aplicações React. Os exemplos usam TypeScript e JSX/TSX.

## 1. Crie componentes pequenos e reutilizáveis

Mantenha cada componente com no máximo 30 linhas. Extraia partes coesas em componentes menores quando houver mais de uma responsabilidade ou quando o componente crescer além desse limite.

### Incorreto

```tsx
function DashboardFranquia({ franquia }: Props) {
  return (
    <main>
      <header>
        <h1>{franquia.nome}</h1>
        <p>{franquia.endereco}</p>
        <button onClick={abrirEdicao}>Editar</button>
      </header>
      <section>
        <h2>Indicadores</h2>
        <p>Faturamento: {franquia.faturamento}</p>
        <p>Clientes: {franquia.clientes}</p>
        <p>Conversão: {franquia.conversao}</p>
      </section>
      <section>
        <h2>Últimos pedidos</h2>
        {franquia.pedidos.map((pedido) => (
          <article key={pedido.id}>{pedido.descricao}</article>
        ))}
      </section>
      <footer>
        <p>Atualizado em {franquia.atualizadoEm}</p>
        <button onClick={abrirSuporte}>Falar com suporte</button>
      </footer>
    </main>
  );
}
```

### Correto

```tsx
function DashboardFranquia({ franquia }: Props) {
  return (
    <main>
      <CabecalhoFranquia franquia={franquia} />
      <IndicadoresFranquia indicadores={franquia.indicadores} />
      <ListaDePedidos pedidos={franquia.pedidos} />
      <RodapeFranquia atualizadoEm={franquia.atualizadoEm} />
    </main>
  );
}
```

Os componentes extraídos devem ter responsabilidades claras e interfaces que permitam sua reutilização em outras telas.

## 2. Evite passar props com spread operators

Passe explicitamente as propriedades que o componente ou elemento deve receber. Isso torna a interface visível e evita que atributos inesperados sejam propagados.

### Incorreto

```tsx
function BotaoEnviar(props: Props) {
  return <button {...props}>Enviar</button>;
}
```

### Correto

```tsx
type BotaoEnviarProps = {
  desabilitado?: boolean;
  onClick: () => void;
};

function BotaoEnviar({ desabilitado = false, onClick }: BotaoEnviarProps) {
  return (
    <button disabled={desabilitado} onClick={onClick} type="submit">
      Enviar
    </button>
  );
}
```

## 3. Evite `useEffect` desnecessário

Não use `useEffect` para calcular valores derivados ou sincronizar estado que pode ser obtido durante a renderização. Reserve-o para efeitos colaterais reais, como assinar eventos externos ou interagir com APIs do navegador.

### Incorreto

```tsx
function Saudacao({ nome }: { nome: string }) {
  const [nomeFormatado, setNomeFormatado] = useState("");

  useEffect(() => {
    setNomeFormatado(nome.trim());
  }, [nome]);

  return <p>Olá, {nomeFormatado}</p>;
}
```

### Correto

```tsx
function Saudacao({ nome }: { nome: string }) {
  const nomeFormatado = nome.trim();
  return <p>Olá, {nomeFormatado}</p>;
}
```

## 4. Use `useMemo` para cálculos pesados entre re-renderizações

Use `useMemo` quando um cálculo for realmente custoso e depender de valores estáveis. Não o utilize automaticamente para expressões simples.

### Incorreto

```tsx
function ListaDeFranquias({ franquias, busca }: Props) {
  const franquiasFiltradas = franquias
    .filter((franquia) => franquia.nome.includes(busca))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return <Tabela franquias={franquiasFiltradas} />;
}
```

### Correto

```tsx
function ListaDeFranquias({ franquias, busca }: Props) {
  const franquiasFiltradas = useMemo(
    () => filtrarEOrdenarFranquias(franquias, busca),
    [franquias, busca],
  );

  return <Tabela franquias={franquiasFiltradas} />;
}
```

## 5. Separe o acesso ao backend do código do componente

Componentes devem cuidar da apresentação e da interação. Coloque chamadas HTTP, transformação de respostas e detalhes do backend em módulos próprios ou hooks especializados.

### Incorreto

```tsx
function ListaDeFranquias() {
  const [franquias, setFranquias] = useState<Franquia[]>([]);

  useEffect(() => {
    fetch("/api/franquias")
      .then((resposta) => resposta.json())
      .then(setFranquias);
  }, []);

  return <Tabela franquias={franquias} />;
}
```

### Correto

```ts
export async function buscarFranquias(): Promise<Franquia[]> {
  const resposta = await fetch("/api/franquias");
  return resposta.json();
}
```

```tsx
function ListaDeFranquias() {
  const { franquias, carregando } = useFranquias();
  if (carregando) return <Carregamento />;
  return <Tabela franquias={franquias} />;
}
```

## 6. Use hooks com `use` para separar lógica do componente

Extraia lógica de estado, carregamento, validação e eventos compartilhados para hooks customizados iniciados por `use`. Um hook deve encapsular lógica, enquanto o componente deve permanecer focado na composição da interface.

### Incorreto

```tsx
function FormularioContato() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

  function enviar() {
    if (!email.includes("@")) {
      setErro("Informe um e-mail válido");
      return;
    }
    enviarContato(email);
  }

  return <Formulario email={email} erro={erro} onEnviar={enviar} />;
}
```

### Correto

```tsx
function useFormularioContato() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const enviar = () => validarEEnviarContato(email, setErro);
  return { email, setEmail, erro, enviar };
}

function FormularioContato() {
  const { email, setEmail, erro, enviar } = useFormularioContato();
  return (
    <Formulario
      email={email}
      erro={erro}
      onAlterarEmail={setEmail}
      onEnviar={enviar}
    />
  );
}
```

## 7. Prefira componentes funcionais

Use funções para declarar componentes. Elas integram naturalmente hooks, composição e tipagem moderna do React.

### Incorreto

```tsx
class TituloFranquia extends React.Component<Props> {
  render() {
    return <h1>{this.props.nome}</h1>;
  }
}
```

### Correto

```tsx
function TituloFranquia({ nome }: Props) {
  return <h1>{nome}</h1>;
}
```

## 8. Utilize propriedades de acessibilidade (`aria-*`)

Forneça nomes acessíveis, estados e relacionamentos para elementos interativos ou componentes que não tenham semântica suficiente. Prefira elementos HTML semânticos e use `aria-*` quando necessário; os valores devem acompanhar o estado real da interface.

### Incorreto

```tsx
function MenuFranquia({ aberto, alternar }: Props) {
  return (
    <>
      <div onClick={alternar}>Menu</div>
      {aberto && <div>Opções da franquia</div>}
    </>
  );
}
```

### Correto

```tsx
function MenuFranquia({ aberto, alternar }: Props) {
  return (
    <>
      <button
        aria-controls="opcoes-franquia"
        aria-expanded={aberto}
        aria-label="Abrir opções da franquia"
        onClick={alternar}
        type="button"
      >
        Menu
      </button>
      <nav aria-label="Opções da franquia" hidden={!aberto} id="opcoes-franquia">
        <a href="/franquia">Detalhes</a>
      </nav>
    </>
  );
}
```

## 9. Estilize componentes com Tailwind CSS

Use classes utilitárias do Tailwind diretamente no JSX e extraia componentes quando um conjunto de classes se repetir. Evite estilos inline e folhas de estilo isoladas para a aparência comum dos componentes.

### Incorreto

```tsx
function CardFranquia({ nome }: { nome: string }) {
  return <div className="card-franquia">{nome}</div>;
}
```

```css
.card-franquia {
  border-radius: 8px;
  padding: 16px;
  background: white;
}
```

### Correto

```tsx
function CardFranquia({ nome }: { nome: string }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{nome}</h2>
    </article>
  );
}
```
