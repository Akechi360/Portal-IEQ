import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  console.log('Testing Prisma Client models...')
  console.log('Admin model exists:', !!prisma.admin)
  console.log('Doctor model exists:', !!prisma.doctor)
  console.log('Credential model exists:', !!prisma.credential)
}

test().catch(console.error)
