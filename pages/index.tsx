import Head from 'next/head'
import { BabyStoreCalculator } from '../components/calculadora/BabyStoreCalculator'

export default function Home() {
  return (
    <>
      <Head>
        <title>Baby Store Calculator - Calculadora de Rentabilidad</title>
        <meta name="description" content="Calculadora de rentabilidad para tiendas de productos para bebés" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <BabyStoreCalculator />
    </>
  )
}