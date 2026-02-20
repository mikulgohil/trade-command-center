export type RouteStatus = 'normal' | 'congested' | 'disrupted'
export type RouteImportance = 'high' | 'medium' | 'low'

export interface TradeRoute {
  id: string
  fromPortId: string
  toPortId: string
  importance: RouteImportance
  status: RouteStatus
  /** Trade volume in thousands of TEUs per year */
  volume: number
}

export const routes: TradeRoute[] = [
  // Asia → Middle East
  { id: 'r01', fromPortId: 'shanghai', toPortId: 'jebel-ali', importance: 'high', status: 'normal', volume: 820 },
  { id: 'r02', fromPortId: 'singapore', toPortId: 'jebel-ali', importance: 'high', status: 'normal', volume: 740 },
  { id: 'r03', fromPortId: 'mumbai', toPortId: 'jebel-ali', importance: 'medium', status: 'normal', volume: 430 },
  { id: 'r04', fromPortId: 'busan', toPortId: 'jebel-ali', importance: 'medium', status: 'normal', volume: 380 },

  // Middle East → Europe
  { id: 'r05', fromPortId: 'jebel-ali', toPortId: 'rotterdam', importance: 'high', status: 'normal', volume: 910 },
  { id: 'r06', fromPortId: 'jebel-ali', toPortId: 'london-gateway', importance: 'medium', status: 'normal', volume: 350 },
  { id: 'r07', fromPortId: 'jebel-ali', toPortId: 'antwerp', importance: 'medium', status: 'normal', volume: 420 },
  { id: 'r08', fromPortId: 'jeddah', toPortId: 'rotterdam', importance: 'low', status: 'normal', volume: 180 },

  // Asia → Europe (direct)
  { id: 'r09', fromPortId: 'shanghai', toPortId: 'rotterdam', importance: 'high', status: 'normal', volume: 1050 },
  { id: 'r10', fromPortId: 'hong-kong', toPortId: 'antwerp', importance: 'medium', status: 'normal', volume: 460 },

  // Asia → Americas
  { id: 'r11', fromPortId: 'shanghai', toPortId: 'los-angeles', importance: 'high', status: 'normal', volume: 1200 },
  { id: 'r12', fromPortId: 'busan', toPortId: 'los-angeles', importance: 'medium', status: 'normal', volume: 520 },
  { id: 'r13', fromPortId: 'shanghai', toPortId: 'vancouver', importance: 'medium', status: 'normal', volume: 480 },
  { id: 'r14', fromPortId: 'hong-kong', toPortId: 'los-angeles', importance: 'medium', status: 'normal', volume: 390 },

  // Intra-Asia
  { id: 'r15', fromPortId: 'shanghai', toPortId: 'singapore', importance: 'high', status: 'normal', volume: 870 },
  { id: 'r16', fromPortId: 'shanghai', toPortId: 'hong-kong', importance: 'medium', status: 'normal', volume: 560 },
  { id: 'r17', fromPortId: 'hong-kong', toPortId: 'singapore', importance: 'medium', status: 'normal', volume: 410 },
  { id: 'r18', fromPortId: 'shanghai', toPortId: 'busan', importance: 'medium', status: 'normal', volume: 490 },

  // South America / Africa
  { id: 'r19', fromPortId: 'santos', toPortId: 'rotterdam', importance: 'medium', status: 'normal', volume: 320 },
  { id: 'r20', fromPortId: 'santos', toPortId: 'durban', importance: 'low', status: 'normal', volume: 140 },
  { id: 'r21', fromPortId: 'mumbai', toPortId: 'durban', importance: 'low', status: 'normal', volume: 160 },
  { id: 'r22', fromPortId: 'singapore', toPortId: 'durban', importance: 'low', status: 'normal', volume: 190 },

  // Oceania
  { id: 'r23', fromPortId: 'singapore', toPortId: 'sydney', importance: 'medium', status: 'normal', volume: 310 },
  { id: 'r24', fromPortId: 'shanghai', toPortId: 'sydney', importance: 'low', status: 'normal', volume: 220 },
]
