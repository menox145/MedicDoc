import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){
  await prisma.user.deleteMany()
  await prisma.spo.deleteMany()
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: '123456', role: 'ADMIN', unit: 'ADMIN' },
      { username: 'mcu', password: '123456', role: 'UNIT', unit: 'MCU' },
      { username: 'igd', password: '123456', role: 'UNIT', unit: 'IGD' },
    ]
  })
}
main()