import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/../auth'
import prisma from '@/lib/db'

async function getUserFromRequest(request: Request) {
  // Check NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    return await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }

  // If no session, try to get email from query params first for GET requests
  const { searchParams } = new URL(request.url)
  const emailFromQuery = searchParams.get('email')
  if (emailFromQuery) {
    return await prisma.user.findUnique({
      where: { email: emailFromQuery },
    })
  }

  // If no query param, try to get email from request body for POST/PUT/DELETE
  try {
    const body = await request.json().catch(() => null)
    if (body?.email) {
      return await prisma.user.findUnique({
        where: { email: body.email },
      })
    }
  } catch (e) {
    // Do nothing
  }

  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { tables: { include: { rows: true } }, user: { select: { email: true } } },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  return NextResponse.json({ plan })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(request)
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  if (plan.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { status, startDate, endDate } = body

  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: {
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  return NextResponse.json({ plan: updatedPlan })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(request)
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  if (plan.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.plan.delete({ where: { id } })
  return NextResponse.json({ message: 'Plan deleted' })
}

// PATCH: Update plan table content (cells, rows, table titles)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(request)
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  if (plan.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { action } = body

  try {
    switch (action) {
      // Update a single cell value
      case 'updateCell': {
        const { tableIndex, rowIndex, colIndex, value } = body
        const table = plan.tables[tableIndex]
        if (!table) return NextResponse.json({ error: 'Invalid table index' }, { status: 400 })
        const row = table.rows[rowIndex]
        if (!row) return NextResponse.json({ error: 'Invalid row index' }, { status: 400 })

        const newColumns = [...row.columns]
        newColumns[colIndex] = value

        await prisma.planRow.update({
          where: { id: row.id },
          data: { columns: newColumns },
        })

        // Return updated tables
        const updatedPlan = await prisma.plan.findUnique({
          where: { id },
          include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
        })
        return NextResponse.json({ plan: updatedPlan })
      }

      // Update an entire row's columns
      case 'updateRow': {
        const { tableIndex, rowIndex, columns } = body
        const table = plan.tables[tableIndex]
        if (!table) return NextResponse.json({ error: 'Invalid table index' }, { status: 400 })
        const row = table.rows[rowIndex]
        if (!row) return NextResponse.json({ error: 'Invalid row index' }, { status: 400 })

        await prisma.planRow.update({
          where: { id: row.id },
          data: { columns },
        })

        const updatedPlan = await prisma.plan.findUnique({
          where: { id },
          include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
        })
        return NextResponse.json({ plan: updatedPlan })
      }

      // Add a new row to a table
      case 'addRow': {
        const { tableIndex, columns } = body
        const table = plan.tables[tableIndex]
        if (!table) return NextResponse.json({ error: 'Invalid table index' }, { status: 400 })

        await prisma.planRow.create({
          data: {
            tableId: table.id,
            columns: columns || table.rows[0]?.columns.map(() => '') || [],
          },
        })

        const updatedPlan = await prisma.plan.findUnique({
          where: { id },
          include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
        })
        return NextResponse.json({ plan: updatedPlan })
      }

      // Remove a row from a table
      case 'removeRow': {
        const { tableIndex, rowIndex } = body
        const table = plan.tables[tableIndex]
        if (!table) return NextResponse.json({ error: 'Invalid table index' }, { status: 400 })
        const row = table.rows[rowIndex]
        if (!row) return NextResponse.json({ error: 'Invalid row index' }, { status: 400 })

        await prisma.planRow.delete({
          where: { id: row.id },
        })

        const updatedPlan = await prisma.plan.findUnique({
          where: { id },
          include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
        })
        return NextResponse.json({ plan: updatedPlan })
      }

      // Update table title
      case 'updateTableTitle': {
        const { tableIndex, title } = body
        const table = plan.tables[tableIndex]
        if (!table) return NextResponse.json({ error: 'Invalid table index' }, { status: 400 })

        await prisma.planTable.update({
          where: { id: table.id },
          data: { title },
        })

        const updatedPlan = await prisma.plan.findUnique({
          where: { id },
          include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
        })
        return NextResponse.json({ plan: updatedPlan })
      }

      // Batch update: replace all tables at once (for AI modifications)
      case 'batchUpdate': {
        const { tables: newTables } = body

        // Delete existing tables and rows
        for (const table of plan.tables) {
          await prisma.planRow.deleteMany({ where: { tableId: table.id } })
        }
        await prisma.planTable.deleteMany({ where: { planId: id } })

        // Create new tables
        for (const table of newTables) {
          const createdTable = await prisma.planTable.create({
            data: {
              planId: id,
              title: table.title,
            },
          })
          if (table.rows?.length) {
            await prisma.planRow.createMany({
              data: table.rows.map((row: any) => ({
                tableId: createdTable.id,
                columns: row.columns,
              })),
            })
          }
        }

        const updatedPlan = await prisma.plan.findUnique({
          where: { id },
          include: { tables: { include: { rows: true }, orderBy: { createdAt: 'asc' } } },
        })
        return NextResponse.json({ plan: updatedPlan })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error('Error patching plan:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
