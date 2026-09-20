import { Hero } from '@/components/marketing/Hero'
import { ProductShowcase } from '@/components/marketing/ProductShowcase'
import { AIIntelligence, AnalyticsSection, BlockIntelligence, FinalCTA, Flow, Industries, Problems, Showroom } from '@/components/marketing/Sections'

export default function Home() {
  return (
    <>
      <Hero />
      <Industries />
      <Problems />
      <Flow />
      <ProductShowcase />
      <BlockIntelligence />
      <AIIntelligence />
      <Showroom />
      <AnalyticsSection />
      <FinalCTA />
    </>
  )
}
