# TASK: Build Analytics Dashboard — DeployPulse

## Objetivo
Criar uma página completa de Analytics em `/analytics` com dashboard interativo, múltiplos charts, filtros de data, data aggregation, e real-time simulation.

## Contexto
- Projeto: DeployPulse (Next.js 15 + TypeScript + Tailwind + shadcn/ui + recharts)
- Path: `C:\Users\VICTOR\Downloads\Claude Code\deploypulse\`
- Dark theme: #0E1117 background
- Mock data: `src/lib/mock-data.ts`
- Types: `src/types/index.ts`
- Utils: `src/lib/utils.ts` (cn, formatDuration, formatUptime, formatLatency, getStatusColor, etc.)
- UI components: `src/components/ui/` (Card, Badge, Button, Tabs, Select, etc.)
- Charts existem em: `src/components/dashboard/ChartCard.tsx` (LatencyChart, Sparkline, UptimeChart)

## Arquivos para criar/modificar

### 1. `src/app/(dashboard)/analytics/page.tsx` (NOVA)
Página principal de analytics com:

**Header:**
- Título "Analytics" com ícone de BarChart3
- Date range picker (Today, 7d, 30d, 90d) — usar state local, NÃO lib externa
- Refresh button com loading spinner

**Layout: KPI Cards (4 cards)**
- Total Monitors (com Sparkline do último dia)
- Overall Uptime % (com trend indicator ↑↓)
- Avg Response Time (com comparacao vs ontem)
- Total Checks Today (com trend)

**Seção 1: Response Time Trends**
- LineChart com 3 linhas: P50, P95, P99 latência
- Legenda interativa
- Gridlines, tooltip customizado
- Dados simulados por hora

**Seção 2: Status Distribution**
- Donut/Pie chart com: Up (verde), Down (vermelho), Degraded (amarelo)
- Center text com overall uptime %
- Legenda lateral com contadores

**Seção 3: Checks Over Time**
- BarChart empilhado: successful (verde) vs failed (vermelho) por dia
- Últimos 30 dias
- Tooltip com detalhes

**Seção 4: Top Monitors by Latency**
- Tabela com: Name, Avg Latency, P95, Uptime %, Trend
- Sortable por qualquer coluna
- Top 10 monitores com pior performance

**Seção 5: Error Analysis**
- Lista de erros agrupados por tipo
- Cada grupo: error message, count, último occurrence, monitores afetados
- Expandível para ver detalhes

**Seção 6: Regional Performance**
- Grid de cards por região (US-East, US-West, EU-West, AP-South)
- Cada card: avg latency, uptime, check count
- Badges de status por região

### 2. `src/lib/analytics-data.ts` (NOVA)
Funções de geração de dados mock:

```typescript
// Tipos
interface HourlyMetric { hour: string; p50: number; p95: number; p99: number }
interface DailyCheck { date: string; successful: number; failed: number }
interface ErrorGroup { message: string; count: number; lastSeen: string; monitors: string[] }
interface RegionalData { region: string; avgLatency: number; uptime: number; checks: number; status: 'healthy' | 'degraded' | 'down' }
interface MonitorPerformance { id: string; name: string; avgLatency: number; p95: number; uptime: number; trend: number }

// Funções
generateHourlyMetrics(hours: number): HourlyMetric[]
generateDailyChecks(days: number): DailyCheck[]
generateErrorGroups(): ErrorGroup[]
generateRegionalData(): RegionalData[]
generateMonitorPerformance(monitors: Monitor[]): MonitorPerformance[]
generateKPIData(monitors: Monitor[]): { totalMonitors: number; overallUptime: number; avgResponseTime: number; totalChecks: number; trends: { uptime: number; responseTime: number; checks: number } }
```

**Regras para dados realistas:**
- Latência P50: 50-200ms, P95: 200-800ms, P99: 500-2000ms
- Uptime: 95-99.99%
- Errors: timeout, connection refused, SSL error, 5xx status, DNS failure
- Regiões com latências diferentes (AP > EU > US)
- Trends: variacao de ±5% entre dias

### 3. `src/components/analytics/MetricCard.tsx` (NOVA)
Componente reutilizável de KPI card:
- Props: title, value, trend (number), sparklineData (optional), icon, format ('number' | 'percent' | 'ms')
- Trend arrow: verde se melhorando, vermelho se piorando
- Sparkline opcional no canto

### 4. `src/components/analytics/StatusDonut.tsx` (NOVA)
Donut chart para status distribution:
- Props: data { up: number, down: number, degraded: number }
- Center text com %
- Legenda lateral
- Cores: emerald-500 (up), red-500 (down), amber-500 (degraded)

### 5. `src/components/analytics/ErrorPanel.tsx` (NOVA)
Painel de erros expansível:
- Props: errors: ErrorGroup[]
- Cada grupo: header com message + count, expandível
- Dentro: lista de monitores afetados + último occurrence
- Empty state quando sem erros

### 6. `src/components/analytics/RegionGrid.tsx` (NOVA)
Grid de performance regional:
- Props: regions: RegionalData[]
- Cards com latência, uptime, status badge
- Layout: grid 2x2 em mobile, 4x1 em desktop

## Regras técnicas
- **ZERO dependências novas** — usar só recharts, shadcn/ui, lucide-react que já existem
- TypeScript strict — NENHUM `any`
- Tudo `'use client'` pois usa state
- Mock data hardcoded (não precisa de API real ainda)
- Dark theme consistente
- Responsive (mobile + desktop)
- Todos os charts devem ter tooltips customizados com mesmo estilo (bg #1E293B, border #334155)
- Animações suaves com Tailwind transitions
- Nenhum console.log no código final

## Referência visual
Estilo similar ao dashboard do Datadog/Grafana mas mais clean e dark.

## Verificação
Rodar `npx tsc --noEmit` e `npm run build` para garantir 0 erros.

## Entrega
Todos os arquivos criados/modificados funcionando, build limpo, sem dependências novas.
