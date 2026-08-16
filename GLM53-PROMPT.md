# DeployPulse — Projeto para GLM 5.3

## O que é
DeployPulse é um SaaS de monitoramento de sites/APIs. Next.js 15 + TypeScript + Tailwind + shadcn/ui, dark-first (#0E1117).

## Stack
- **Framework:** Next.js 15 (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** recharts
- **Ícones:** lucide-react
- **Estado:** localStorage (mock data, Supabase pausado)
- **Deploy:** Vercel (deploy-pulse-xi.vercel.app)

## Estrutura do projeto
```
deploypulse/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # DashboardLayout com sidebar
│   │       ├── page.tsx            # Home
│   │       └── monitors/
│   │           ├── page.tsx        # Lista de monitores
│   │           └── [id]/page.tsx   # Detalhe do monitor (ESTAMOS AQUI)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── MonitorTable.tsx    # Tabela de monitores
│   │   │   └── ChartCard.tsx       # LatencyChart, Sparkline, UptimeChart
│   │   ├── monitors/
│   │   │   ├── MonitorDetail.tsx   # Componente rich com tabs
│   │   │   ├── LatencyChart.tsx    # Chart que aceita Check[]
│   │   │   └── CheckHistory.tsx    # Histórico de checks
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── api-client.ts           # MonitorDetails type
│   │   ├── mock-data.ts            # generateLatencyData(), generateMockChecks()
│   │   ├── monitor-store.ts        # CRUD localStorage
│   │   └── utils.ts                # cn, formatDuration, formatUptime, etc.
│   └── types/
│       └── index.ts                # Monitor, Check, MonitorType, MonitorStatus
```

## Estado atual
- MonitorTable: coluna nome é clicável → navega para `/monitors/[id]`
- Detail page (`[id]/page.tsx`): mostra stats, chart de latência, histórico de checks, config
- Tudo com mock data (generateLatencyData, generateMockChecks)
- Build limpo, 0 erros TypeScript

## Tipos principais
```typescript
interface Monitor {
  id: string; projectId: string; name: string; url: string;
  type: MonitorType; interval: number; timeout: number; retries: number;
  status: MonitorStatus; lastCheck?: string; lastStatusCode?: number;
  lastLatency?: number; uptime?: number; tags: string[];
  createdAt: string; updatedAt: string;
}

interface Check {
  id: string; monitorId: string; status: string; statusCode: number;
  latency: number; error?: string; checkedAt: string; region?: string;
}

type MonitorType = 'http' | 'https' | 'tcp' | 'ping' | 'keyword' | 'dns' | 'ssl' | 'cron' | 'webhook' | 'health' | 'background-job';
type MonitorStatus = 'up' | 'down' | 'pending' | 'maintenance' | 'degraded' | 'disabled';
```

## O que fazer
Melhorar a detail page do monitor com mais análises:
1. **Response Time Distribution** — histograma de latência
2. **Status Breakdown** — pie/donut chart com proporção up/down/degraded
3. **Regional Performance** — se tiver dados por região
4. **Error Analysis** — lista de erros recentes com frequência
5. **Response Headers** — se disponível
6. **SSL Certificate Info** — dias até expirar
7. **Trend Comparison** — comparar hoje vs ontem vs semana passada

## Regras
- Dark theme (#0E1117 background)
- shadcn/ui components (Card, Badge, Tabs, etc.)
- recharts para charts
- lucide-react para ícones
- Mock data está em `src/lib/mock-data.ts`
- NÃO adicionar dependências novas se possível
- Manter tipagem TypeScript sem `any`
