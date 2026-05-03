import { Card as ShadcnCard, CardContent } from "@/components/ui/card"

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <ShadcnCard className="mb-5 shadow-lg border-none bg-card">
      <CardContent className="p-6">
        {children}
      </CardContent>
    </ShadcnCard>
  )
}